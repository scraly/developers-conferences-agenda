import sys
from datetime import datetime
import json

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

def print_usage():
	print("USAGE:")
	print("python3 parser.py <year> [outputFile]")
	print()
	print("<year> could be \"README\" to parse main README file.")
	print("[outputFile] defaults to stdout")
	exit(1)

def parse_extended_date(s):
	day, month = s.split('/')
	# TODO: Check if str.isnumeric()

	return int(day), int(month)

def parse_date(y, m, s):
	datStart = datetime(y, m, 1)
	datEnd = datetime(y, m, 1)
	components = s.split('-')

	# Is there any way this could be better for the eyes?
	# components == ['4']
	if len(components) == 1:
		if '/' in components[0]:
			_d, _m = parse_extended_date(components[0])
			datStart = datetime(y, _m, _d)
			datEnd = datetime(y, _m, _d)
		else:
			datStart = datetime(y, m, int(components[0]))
			datEnd = datetime(y, m, int(components[0]))
	# components == ['4', '5']
	elif len(components) == 2:
		if '/' in components[0]:
			_d, _m = parse_extended_date(components[0])
			datStart = datetime(y, _m, _d)
		else:
			datStart = datetime(y, m, int(components[0]))

		if '/' in components[1]:
			_d, _m = parse_extended_date(components[1])
			datEnd = datetime(y, _m, _d)
		else:
			datEnd = datetime(y, m, int(components[1]))
			# for dates such as '27-01: Elastic{ON} - USA (San Francisco)'
			if datEnd < datStart:
				if datStart.month < 12:
					datEnd = datetime(y, datEnd.month + 1, datEnd.day)
				else:
					datEnd = datetime(y + 1, 1, datEnd.day)

	return [
		int(datStart.timestamp()),
		int(datEnd.timestamp()) + 1
	]

def parse_event_name(s):
	counter = 0
	final = ''
	escapedState = False

	# s[1:] to skip prefix '[' in Markdown
	counter += 1
	for ch in s[1:]:
		counter += 1
		if ch == '\\':
			escapedState = True
			continue
		if escapedState:
			final += ch
		elif ch != ']':
			final += ch
		elif ch == ']':
			# Done.
			break

	return final, s[counter:]

def parse_hyperlink(s):
	counter = 0
	final = ''
	escapedState = False

	# s[1:] to skip prefix '[' in Markdown
	counter += 1
	for ch in s[1:]:
		counter += 1
		if ch == '\\':
			escapedState = True
			continue
		if escapedState:
			final += ch
		elif ch != ')':
			final += ch
		elif ch == ')':
			# Done.
			break

	return final, s[counter:]

def parse_location(s):
	# TODO: This is harder than i thought. Seeking community help.

	#  - testing - City (Place) <a></a>
	# ^-^-- [1]                 ^-- [2] This thing

	# [1]
	s = s[3:]

	# [2]
	symbolLocation = [None, len(s)]
	try:
		symbolLocation = [s.index('<')] * 2
	except ValueError:
		# Substring not found
		...

	return s[:symbolLocation[0]], s[symbolLocation[1]:]

def normalize_source(s):
	if s == "README":
		return "../README.md"

	# `s` already filtered with str.isnumeric at main()
	return f"../archives/{s}.md"

def main():
	argv = sys.argv[1:]

	# Check arguments
	if len(argv) == 0:
		print_usage()

	if not argv[0].isnumeric() and argv[0] != "README":
		print_usage()

	# Give default value
	argv.append(f"-")

	# Start process
	data = list()
	source = normalize_source(argv[0])
	output = argv[1]
	with open(source) as sourceFile:
		year = -1
		month = -1
		for line in sourceFile:
			# Remove redundant new line
			if line[-1] == '\n':
				line = line[:-1]

			# Check for year change
			if line.startswith('## '):
				y = line[3:].split(' ')[0].strip()
				if y.isnumeric():
					year = int(y)
			# Check for month change
			if line.startswith('### '):
				_month = line[4:].split(' ')[0].strip()
				if _month in MONTHS:
					month = MONTHS.index(_month) + 1

			# Check if line doesn't starts with '*'
			if not line.startswith('*'):
				continue

			# TODO: Can't we just use RegEx?
			# If they did, check if the next character is whitepace(s)
			# followed by a number
			invalid_flag_1 = True
			already_white_space = 0
			for ch in line[1:]:
				if ch in ' \t':
					already_white_space += 1
					continue

				if ch.isnumeric() and already_white_space:
					# Got it, this is valid
					invalid_flag_1 = False
					break
				elif not ch.isnumeric():
					# Invalid
					break

			# If the line is invalid, drop it.
			if invalid_flag_1:
				continue

			# This variable also holds how many character before we
			# effectively parse stuff
			already_white_space += 1

			# Now we have a valid line...
			# Parse them into: range(start, end+1), eventName, hyperlink, location, misc.
			date, _n = line[already_white_space:].split(': ', maxsplit=1)
			date = parse_date(year, month, date)

			eventName, _n = parse_event_name(_n)
			hyperlink, _n = parse_hyperlink(_n)
			location, misc = parse_location(_n)

			data.append({
				"name": eventName,
				"date": date,
				"hyperlink": hyperlink,
				"location": location,
				"misc": misc
			})

	# Finished parsing
	# Let's go!
	if output == '-':
		print(json.dumps(data))

if __name__ == "__main__":
	main()
