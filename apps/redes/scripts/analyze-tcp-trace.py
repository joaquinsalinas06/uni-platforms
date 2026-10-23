#!/usr/bin/env python3
"""Exporta evidencia reproducible del PCAPNG oficial; ejecutar desde apps/redes."""
import csv
import io
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
TSHARK = shutil.which('tshark') or '/Applications/Wireshark.app/Contents/MacOS/tshark'
SOURCE = ROOT / 'public/labs/tcp/tcp-wireshark-trace1-1.pcapng'
FIELDS = ['frame.number', 'frame.time_relative', 'ip.src', 'tcp.srcport', 'ip.dst',
          'tcp.dstport', 'tcp.stream', 'tcp.seq', 'tcp.ack', 'tcp.len', 'tcp.flags',
          'tcp.window_size_value', 'tcp.window_size', 'tcp.options.mss_val',
          'tcp.analysis.ack_rtt', 'tcp.analysis.retransmission',
          'tcp.analysis.fast_retransmission', 'tcp.analysis.duplicate_ack']


def analyze():
    command = [TSHARK, '-n', '-r', str(SOURCE), '-Y', 'tcp', '-T', 'fields',
               '-E', 'header=y', '-E', 'separator=,', '-E', 'quote=d', '-E', 'occurrence=f']
    for field in FIELDS:
        command += ['-e', field]
    output = subprocess.check_output(command, text=True)
    rows = list(csv.DictReader(io.StringIO(output)))
    # Identifica el cliente por el SYN inicial, no por una IP escrita a mano.
    syn = next(r for r in rows if int(r['tcp.flags'], 16) & 0x12 == 0x02)
    client = (syn['ip.src'], syn['tcp.srcport'])
    stream = syn['tcp.stream']
    flow = [r for r in rows if r['tcp.stream'] == stream]
    outgoing = [r for r in flow if (r['ip.src'], r['tcp.srcport']) == client]
    data = [r for r in outgoing if int(r['tcp.len']) > 0]
    samples = []
    estimate = None
    for sent in data[:6]:
        end = int(sent['tcp.seq']) + int(sent['tcp.len'])
        ack = next(r for r in flow if (r['ip.src'], r['tcp.srcport']) != client
                   and float(r['frame.time_relative']) > float(sent['frame.time_relative'])
                   and int(r['tcp.ack']) >= end)
        sample = float(ack['frame.time_relative']) - float(sent['frame.time_relative'])
        estimate = sample if estimate is None else .875 * estimate + .125 * sample
        samples.append(dict(frame=int(sent['frame.number']), seq=int(sent['tcp.seq']),
                            length=int(sent['tcp.len']), sent=float(sent['frame.time_relative']),
                            ack_frame=int(ack['frame.number']), ack=int(ack['tcp.ack']),
                            received=float(ack['frame.time_relative']), sample_rtt=sample,
                            estimated_rtt=estimate))
    summary = dict(source=SOURCE.name, stream=int(stream), frames=len(flow),
                   client=f"{client[0]}:{client[1]}",
                   server=f"{syn['ip.dst']}:{syn['tcp.dstport']}",
                   client_data_segments=len(data), client_payload_bytes=sum(int(r['tcp.len']) for r in data),
                   server_data_segments=sum(int(r['tcp.len']) > 0 for r in flow if r not in outgoing),
                   fin_frames=[int(r['frame.number']) for r in flow if int(r['tcp.flags'], 16) & 1],
                   rst_frames=[int(r['frame.number']) for r in flow if int(r['tcp.flags'], 16) & 4],
                   retransmission_frames=[int(r['frame.number']) for r in flow if r['tcp.analysis.retransmission'] or r['tcp.analysis.fast_retransmission']],
                   client_initial_window=int(syn['tcp.window_size_value']),
                   client_max_window=max(int(r['tcp.window_size']) for r in outgoing),
                   server_initial_window=int(flow[1]['tcp.window_size_value']),
                   server_max_window=max(int(r['tcp.window_size']) for r in flow if r not in outgoing),
                   samples=samples,
                   stevens=[[float(r['frame.time_relative']), int(r['tcp.seq'])] for r in data])
    assert len(samples) == 6 and samples[0]['frame'] == 4
    target = ROOT / 'public/labs/tcp'
    target.mkdir(parents=True, exist_ok=True)
    (target / 'tcp-trace.csv').write_text(output)
    (target / 'tcp-trace.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps({k: v for k, v in summary.items() if k != 'stevens'}, indent=2))


if __name__ == '__main__':
    analyze()
