import os
import sys
import json

def print_usage():
	print('USAGE:')
	print('python3 combine.py FILE1 [[FILE2]...] ')
	print()
	print('Output will be directed to stdout.')

	exit(1)

def main():
	argv = sys.argv[1:]

	if len(argv) == 0:
		print_usage()

	final = []
	for file in argv:
		with open(file, 'r') as f:
			content = json.loads(f.read())
			final.extend(content)

	print(json.dumps(final))

if __name__ == '__main__':
	main()
