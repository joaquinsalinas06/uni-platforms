#!/usr/bin/env python3
"""LAB3 / Ex4: mensajes delimitados y transferencia por EOF; solo biblioteca estándar."""
import argparse
import hashlib
from pathlib import Path
import socket
import struct
import time

MAX_MESSAGE = 1024 * 1024


def recv_exact(conn, count):
    data = bytearray()
    while len(data) < count:
        chunk = conn.recv(count - len(data))
        if not chunk:
            raise EOFError('Conexión cerrada antes de completar el mensaje')
        data.extend(chunk)
    return bytes(data)


def send_message(conn, data):
    if len(data) > MAX_MESSAGE:
        raise ValueError('Mensaje mayor que 1 MiB')
    conn.sendall(struct.pack('!I', len(data)) + data)


def receive_message(conn):
    size = struct.unpack('!I', recv_exact(conn, 4))[0]
    if size > MAX_MESSAGE:
        raise ValueError('Longitud de mensaje mayor que 1 MiB')
    return recv_exact(conn, size)


def serve_messages(conn, delay=2):
    # El cliente anuncia el final con un mensaje vacío, no con un recv parcial.
    while True:
        message = receive_message(conn)
        if not message:
            return
        time.sleep(delay)
        send_message(conn, b'ACK aplicacion')


def exchange_messages(conn, messages, pause=1):
    elapsed = []
    for message in messages:
        start = time.perf_counter()
        send_message(conn, message)
        reply = receive_message(conn)
        duration = time.perf_counter() - start
        elapsed.append(duration)
        print(f'{reply.decode("utf-8")} | RTT aplicacion={duration:.6f} s')
        time.sleep(pause)
    send_message(conn, b'')
    return elapsed


def receive_file(conn, destination):
    destination = Path(destination)
    digest = hashlib.sha256()
    count = 0
    # xb impide sobrescribir un archivo existente por accidente.
    with destination.open('xb') as target:
        while chunk := conn.recv(65536):
            target.write(chunk)
            digest.update(chunk)
            count += len(chunk)
    checksum = digest.hexdigest()
    send_message(conn, f'{count} {checksum}'.encode('ascii'))
    return count, checksum


def send_file(conn, source):
    digest = hashlib.sha256()
    count = 0
    with Path(source).open('rb') as origin:
        while chunk := origin.read(65536):
            conn.sendall(chunk)
            digest.update(chunk)
            count += len(chunk)
    # Termina solo el envío: aún podemos recibir la confirmación del servidor.
    conn.shutdown(socket.SHUT_WR)
    expected = f'{count} {digest.hexdigest()}'
    actual = receive_message(conn).decode('ascii')
    if actual != expected:
        raise ValueError(f'Integridad incorrecta: esperado {expected}, recibido {actual}')
    print(f'Verificado: {actual}')
    return count, digest.hexdigest()


def port_from_id(identifier):
    digits = ''.join(c for c in str(identifier) if c.isdigit())
    if len(digits) < 5:
        raise ValueError('El codigo/DNI debe tener al menos cinco digitos')
    port = int(digits[-5:])
    if port > 65535:
        port = int(digits[-4:])
    if not 1 <= port <= 65535:
        raise ValueError('Los digitos terminan en puerto 0: elegir puerto valido con el docente')
    return port


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['server', 'client', 'receive', 'send'])
    parser.add_argument('--host', default='127.0.0.1', help='IP local al escuchar; IP del servidor al conectar')
    parser.add_argument('--port', type=int, default=5000)
    parser.add_argument('--student-id', help='Ultimos cinco digitos; si excede 65535 usa cuatro')
    parser.add_argument('--file', type=Path, help='Archivo origen (send) o destino nuevo (receive)')
    args = parser.parse_args()
    if args.student_id:
        try:
            args.port = port_from_id(args.student_id)
        except ValueError as error:
            parser.error(str(error))
    if not 1 <= args.port <= 65535:
        parser.error('El puerto debe estar entre 1 y 65535')
    if args.mode in ('receive', 'send') and args.file is None:
        parser.error('--file es obligatorio para transferir archivos')
    try:
        if args.mode in ('server', 'receive'):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listener:
                listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                listener.bind((args.host, args.port))
                listener.listen(1)
                listener.settimeout(120)
                print(f'Escuchando en {args.host}:{args.port}', flush=True)
                conn, address = listener.accept()
                with conn:
                    conn.settimeout(30)
                    print(f'Cliente: {address}', flush=True)
                    if args.mode == 'server':
                        serve_messages(conn)
                    else:
                        print(receive_file(conn, args.file))
        else:
            with socket.create_connection((args.host, args.port), timeout=30) as conn:
                if args.mode == 'client':
                    exchange_messages(conn, [b'Mensaje 1', b'Mensaje 2', b'Mensaje 3'])
                else:
                    send_file(conn, args.file)
    except (OSError, EOFError, ValueError) as error:
        parser.exit(1, f'Error: {error}\n')


if __name__ == '__main__':
    main()
