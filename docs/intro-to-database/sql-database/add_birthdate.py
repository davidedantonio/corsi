"""
Uso: python3 add_birthdate.py input.sql output.sql

Aggiunge una data di nascita casuale (tra 1950 e 2010) come quarto campo
in ogni riga VALUES di una query INSERT INTO users.

La query deve avere questa struttura:
  INSERT INTO users (username, email, full_name, birth_date, created_on, last_login)
  VALUES
    ('username', 'email', 'Full Name', NOW() - interval '...', ...),
    ...
"""

import random
import re
import sys

def random_birth_date():
    year = random.randint(1950, 2010)
    month = random.randint(1, 12)
    if month in [4, 6, 9, 11]:
        day = random.randint(1, 30)
    elif month == 2:
        if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0):
            day = random.randint(1, 29)
        else:
            day = random.randint(1, 28)
    else:
        day = random.randint(1, 31)
    return f"{year}-{month:02d}-{day:02d}"

def main():
    if len(sys.argv) != 3:
        print("Uso: python3 add_birthdate.py input.sql output.sql")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(input_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    # Cerca ogni riga VALUES con 3 campi stringa seguiti da NOW()
    # e inserisce la birth_date tra il terzo campo e NOW()
    pattern = re.compile(
        r"(\('[^']*(?:''[^']*)*',\s*'[^']*(?:''[^']*)*',\s*'(?:[^']|'')*'),(\s*NOW\(\))"
    )

    count = len(pattern.findall(sql))
    result = pattern.sub(
        lambda m: f"{m.group(1)}, '{random_birth_date()}',{m.group(2)}",
        sql
    )

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(result)

    print(f"✅ Completato! Righe modificate: {count}")
    print(f"📄 File salvato in: {output_file}")

if __name__ == "__main__":
    main()
