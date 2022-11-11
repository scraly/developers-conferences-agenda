import sys
import os
import os.path as path

def print_usage():
	pass

def parse_event_name(s):
	pass

def parse_hyperlink(s):
	pass

def parse_location(s):
	pass

def normalize_source(s):
	pass

def main():
	argv = sys.argv[1:]

	# Check arguments
	if len(argv) == 0:
		print_usage()

	if not argv[0].isnumeric() and argv[0] != "README":
		print_usage()

	# Give default value
	argv.append(f"{argv[0]}.json")
	if not path.exists(path.realpath(argv[1])):
		print_usage()

	# Start process
	source = normalize_source(argv[0])
	output = argv[1]
	with open(source) as sourceFile:
		for line in sourceFile:
			# Check if line doesn't starts with '*'
			if not line.startsWith('*'):
				continue

			# TODO: Can't we just use RegEx?
			# If they did, check if the next character is whitepace(s)
			# followed by a number
			invalid_flag_1 = True
			already_white_space = 0
			for ch in line[1:]:
				if ch in ' \t':
					already_white_space += 1
				if ch.isnumeric() and already_white_space:
					# Got it, this is valid
					invalid_flag_1 = False
					break

			# If the line is invalid, drop it.
			if invalid_flag_1:
				continue

			# This variable also holds how many character before we
			# effectively parse stuff
			already_white_space += 1

			# Now we have a valid line...
			# Parse them into: range(start, end+1), eventName, hyperlink, location, misc.
			date, _n = line[already_white_space:].split(': ')
			date = parse_date(date)

			eventName, _n = parse_event_name(_n)
			hyperlink, _n = parse_hyperlink(_n)
			location, misc = parse_location(_n)

			print(f"{date}, {eventName}, {hyperlink}, {location}")

if __name__ == "__main__":
	main()
