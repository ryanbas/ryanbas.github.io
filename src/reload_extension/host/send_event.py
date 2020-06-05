# Sample for sending messages used:
# https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/nativeMessaging

import struct
import sys
import time

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
  import os, msvcrt
  msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
  msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

# Helper function that sends a message to the webapp.
def send_message(message):
  # Write message size.
  sys.stdout.write(struct.pack('I', len(message)))
  # Write the message itself.
  sys.stdout.write(message)
  sys.stdout.flush()

def Main():
  message = '{"reload":true}'
  while True:
      send_message(message)
      time.sleep(5)


if __name__ == '__main__':
  Main()