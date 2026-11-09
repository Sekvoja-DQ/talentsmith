import csv,sys
csv.field_size_limit(10**9)
D='/mnt/user-data/uploads/WOW_sucker_for_TALENTSMITH/'
def rows(n):
    with open(D+n+'.csv',encoding='utf-8') as f: return list(csv.DictReader(f,delimiter=';'))
def ints(s): return [int(float(x)) for x in s.split(',')] if s else []
