"""Comprueba resultados publicados y comportamiento real de los sockets del laboratorio."""
from concurrent.futures import ThreadPoolExecutor
import csv
from decimal import Decimal as D
import hashlib
import importlib.util
import ipaddress
import json
from pathlib import Path
import re
import socket
import struct
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('tcp_lab', ROOT / 'public/labs/tcp/tcp_lab.py')
lab = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lab)


class SocketTests(unittest.TestCase):
    def loopback(self, handler, action):
        with socket.socket() as listener, ThreadPoolExecutor(max_workers=1) as pool:
            listener.bind(('127.0.0.1', 0))
            listener.listen(1)
            listener.settimeout(5)

            def server():
                conn, _ = listener.accept()
                with conn:
                    conn.settimeout(10)
                    return handler(conn)

            future = pool.submit(server)
            with socket.create_connection(listener.getsockname(), timeout=10) as conn:
                result = action(conn)
            return result, future.result(timeout=10)

    def test_fragmented_header_and_body(self):
        def sender(conn):
            wire = struct.pack('!I', 5) + b'hello'
            for byte in wire:
                conn.sendall(bytes([byte]))
                time.sleep(.001)
        result, _ = self.loopback(sender, lab.receive_message)
        self.assertEqual(result, b'hello')

    def test_coalesced_messages_and_empty(self):
        def sender(conn):
            conn.sendall(struct.pack('!I', 1) + b'a' + struct.pack('!I', 2) + b'bc' + struct.pack('!I', 0))
        result, _ = self.loopback(sender, lambda c: [lab.receive_message(c) for _ in range(3)])
        self.assertEqual(result, [b'a', b'bc', b''])

    def test_eof_mid_message(self):
        def sender(conn):
            conn.sendall(struct.pack('!I', 10) + b'abc')
        with self.assertRaises(EOFError):
            self.loopback(sender, lab.receive_message)

    def test_eof_mid_header(self):
        with self.assertRaises(EOFError):
            self.loopback(lambda c: c.sendall(b'\x00\x00'), lab.receive_message)

    def test_reject_oversized_frame(self):
        with self.assertRaises(ValueError):
            self.loopback(lambda c: c.sendall(struct.pack('!I', lab.MAX_MESSAGE + 1)), lab.receive_message)

    def test_persistent_three_messages_real_processing_delay(self):
        # Conserva los 2 s del enunciado; el CLI usa la pausa por defecto de 1 s.
        elapsed, _ = self.loopback(lab.serve_messages,
                                  lambda c: lab.exchange_messages(c, [b'uno', b'dos', b'tres'], pause=0))
        self.assertEqual(len(elapsed), 3)
        self.assertTrue(all(t >= 2 for t in elapsed))

    def test_file_bytes_hash_unicode_path_and_empty_file(self):
        with tempfile.TemporaryDirectory() as folder:
            for i, payload in enumerate([bytes(range(256)) * 800, b'']):
                source = Path(folder) / f'origen ñ {i}.txt'
                target = Path(folder) / f'recibido ñ {i}.txt'
                source.write_bytes(payload)
                sent, received = self.loopback(lambda c: lab.receive_file(c, target),
                                                lambda c: lab.send_file(c, source))
                expected = (len(payload), hashlib.sha256(payload).hexdigest())
                self.assertEqual(sent, expected)
                self.assertEqual(received, expected)
                self.assertEqual(target.read_bytes(), payload)

    def test_never_overwrites_destination(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'existing.txt'
            target.write_bytes(b'conservar')
            with socket.socket() as conn, self.assertRaises(FileExistsError):
                lab.receive_file(conn, target)
            self.assertEqual(target.read_bytes(), b'conservar')

    def test_cli_three_messages_and_one_second_pauses(self):
        with socket.socket() as reserve:
            reserve.bind(('127.0.0.1', 0))
            port = reserve.getsockname()[1]
        command = [sys.executable, str(ROOT / 'public/labs/tcp/tcp_lab.py')]
        server = subprocess.Popen(command + ['server', '--port', str(port)],
                                  stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            self.assertIn('Escuchando', server.stdout.readline())
            start = time.perf_counter()
            client = subprocess.run(command + ['client', '--port', str(port)],
                                    capture_output=True, text=True, timeout=20)
            self.assertEqual(client.returncode, 0, client.stderr)
            self.assertEqual(client.stdout.count('ACK aplicacion'), 3)
            self.assertGreaterEqual(time.perf_counter() - start, 9)
            self.assertEqual(server.wait(timeout=5), 0)
        finally:
            if server.poll() is None:
                server.kill()
            server.communicate(timeout=5)

    def test_cli_invalid_port(self):
        result = subprocess.run([sys.executable, str(ROOT / 'public/labs/tcp/tcp_lab.py'),
                                 'server', '--port', '65536'], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('65535', result.stderr)


class PublishedResultTests(unittest.TestCase):
    def test_trace_csv_independently_supports_rtt_summary(self):
        summary = json.loads((ROOT / 'public/labs/tcp/tcp-trace.json').read_text())
        with (ROOT / 'public/labs/tcp/tcp-trace.csv').open() as file:
            rows = list(csv.DictReader(file))
        self.assertEqual(len(rows), summary['frames'])
        by_frame = {int(r['frame.number']): r for r in rows}
        estimate = None
        for sample in summary['samples']:
            sent, ack = by_frame[sample['frame']], by_frame[sample['ack_frame']]
            self.assertEqual(int(sent['tcp.seq']) + int(sent['tcp.len']), int(ack['tcp.ack']))
            measured = D(ack['frame.time_relative']) - D(sent['frame.time_relative'])
            estimate = measured if estimate is None else D('.875') * estimate + D('.125') * measured
            self.assertAlmostEqual(float(measured), sample['sample_rtt'], places=12)
            self.assertAlmostEqual(float(estimate), sample['estimated_rtt'], places=12)
            # Contrasta también con el análisis de Wireshark, calculado fuera del exportador.
            self.assertAlmostEqual(float(ack['tcp.analysis.ack_rtt']), sample['sample_rtt'], places=9)
        self.assertEqual(summary['client_data_segments'], 106)
        self.assertEqual(summary['fin_frames'], [])
        self.assertEqual(summary['retransmission_frames'], [])

    def test_gbn_sr_tcp_counts_from_receiver_events(self):
        doc = (ROOT / 'content/evaluaciones/laboratorio/ejercicios-4-tcp.mdx').read_text()
        for protocol in ['GBN', 'SR', 'TCP']:
            transmissions = [1, 2, 3, 4, 5] + ([2, 3, 4, 5] if protocol == 'GBN' else [2])
            expected, buffer, acknowledgments = 1, set(), []
            for index, segment in enumerate(transmissions):
                if index == 1:  # Única pérdida: el envío inicial de S2.
                    continue
                if protocol != 'GBN' or segment == expected:
                    buffer.add(segment)
                while expected in buffer:
                    buffer.remove(expected)
                    expected += 1
                ack = segment if protocol == 'SR' else expected if protocol == 'TCP' else expected - 1
                acknowledgments.append(ack)
            self.assertEqual(expected, 6)
            if protocol == 'TCP':
                self.assertEqual(acknowledgments, [2, 2, 2, 2, 6])
            row = re.search(rf'^\| {protocol} \|.*$', doc, re.M).group(0)
            totals = list(map(int, re.findall(r'\*\*(\d+)\*\*', row)))
            self.assertEqual(totals, [len(transmissions), len(acknowledgments)])

    def test_ex4_rtt_table_with_decimal_arithmetic(self):
        doc = (ROOT / 'content/evaluaciones/laboratorio/ejercicios-4-tcp.mdx').read_text()
        estimate, deviation = D(100), D(5)
        for sample in [106, 120, 140]:
            estimate = (7 * estimate + D(sample)) / 8
            deviation = (3 * deviation + abs(D(sample) - estimate)) / 4
            timeout = estimate + 4 * deviation
            row = re.search(rf'^\| {sample} \| ([\d.]+) \| ([\d.]+) \| ([\d.]+) \|$', doc, re.M)
            self.assertIsNotNone(row)
            for actual, expected in zip(row.groups(), [estimate, deviation, timeout]):
                self.assertLess(abs(D(actual) - expected), D('.000000001'))

    def test_tahoe_reno_tables_from_round_rules(self):
        doc = (ROOT / 'content/evaluaciones/laboratorio/ejercicios-4-tcp.mdx').read_text()
        table = {int(r[0]): list(map(float, r[1:])) for r in re.findall(
            r'^\| (\d+) \| ([\d.]+) \| ([\d.]+) \| ([\d.]+) \| ([\d.]+) \| [^|]+ \|$', doc, re.M)}
        for protocol, col in [('Tahoe', 0), ('Reno', 2)]:
            window, threshold = 1, 8
            for round_number in range(1, 13):
                self.assertEqual(table[round_number][col:col+2], [window, threshold])
                if round_number in (4, 9):
                    threshold = window / 2
                    window = threshold if protocol == 'Reno' and round_number == 4 else 1
                else:
                    window = min(window * 2, threshold) if window < threshold else window + 1

    def test_fragmentation_and_cidr_examples(self):
        data, offset = 4000 - 20, 0
        fragments = []
        while data:
            size = min(data, ((1500 - 20) // 8) * 8)
            data -= size
            fragments.append((size + 20, offset // 8, int(data > 0)))
            offset += size
        self.assertEqual(fragments, [(1500, 0, 1), (1500, 185, 1), (1040, 370, 0)])
        network = ipaddress.ip_network('200.23.16.0/23')
        self.assertEqual(str(network.netmask), '255.255.254.0')
        self.assertEqual(str(network.broadcast_address), '200.23.17.255')
        self.assertEqual(network.num_addresses, 512)
        blocks = [ipaddress.ip_network(f'200.23.{i}.0/23') for i in range(16, 32, 2)]
        self.assertEqual([str(n) for n in ipaddress.collapse_addresses(blocks)], ['200.23.16.0/20'])

    def test_published_python_matches_download(self):
        page = (ROOT / 'content/evaluaciones/laboratorio/lab3-tcp-p2.mdx').read_text()
        code = re.search(r'```python\n([\s\S]*?)```', page).group(1)
        self.assertEqual(code, (ROOT / 'public/labs/tcp/tcp_lab.py').read_text())

    def test_source_coverage_targets_and_all_ex4_questions(self):
        coverage = json.loads((ROOT / 'content/source-coverage.json').read_text())
        for source in coverage['sources']:
            seen_pages = set()
            for section in source['sections']:
                seen_pages.update(section['pages'])
                for target in section['targets']:
                    self.assertTrue((ROOT / target).is_file(), target)
            self.assertEqual(seen_pages, set(range(1, source['pageCount']+1)), source['file'])
        doc = (ROOT / 'content/evaluaciones/laboratorio/ejercicios-4-tcp.mdx').read_text()
        self.assertEqual(re.findall(r'^## Pregunta (\d+)\.', doc, re.M), list(map(str, range(1, 10))))


if __name__ == '__main__':
    unittest.main()
