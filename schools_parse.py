# abbreviations taken from https://en.wikipedia.org/wiki/List_of_Singapore_abbreviations


schools = []
with open('schools', 'r', encoding='utf8') as f:
    schools = f.readlines()

actual_schools = []

filters = ['institution', 'college', 'school', 'polytechnic']
for i in schools:
    valid = False
    for filter in filters:
        if filter in i.lower():
            valid = True
    if valid:
        actual_schools.append(i)

abbreviations = [i.split()[0]+'\n' for i in actual_schools]

with open('school_filter', 'w') as f:
    f.writelines(abbreviations)