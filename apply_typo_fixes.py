import json

path = 'C:/Users/Lenovo/.gemini/antigravity/scratch/alphastorytime-studio/part2_word_timestamps.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Segment word corrections: (segment_id, word_no) -> new_word
corrections = {
    # Segment 1
    (1, 6): "membeku",           # membekuk -> membeku
    (1, 9): "Pos",               # pos -> Pos
    (1, 10): "Lima",             # 5 -> Lima
    (1, 14): "napas",            # nappas -> napas
    (1, 15): "dingin",           # tingin -> dingin
    (1, 16): "berhembus",        # berkembus -> berhembus
    (1, 31): "Jujur",            # Jojur -> Jujur
    (1, 39): "refleks",          # reflekt -> refleks
    (1, 43): "sekencang-",       # sken -> sekencang-
    (1, 44): "kencangnya.",      # -kencengnya. -> kencangnya.
    (1, 54): "wanti-",           # wanti -> wanti-
    (1, 55): "wanti",            # -wanti -> wanti
    (1, 57): "senior",           # senyor -> senior
    (1, 60): "basecamp.",        # beskam. -> basecamp.
    (1, 67): "Pasar",            # pasar -> Pasar
    (1, 68): "Setan,",           # setan, -> Setan,

    # Segment 2
    (2, 3): "tersesat",          # tesosat -> tersesat
    (2, 4): "selamanya",         # selama -> selamanya
    (2, 8): "Dengan",            # Degang -> Dengan
    (2, 9): "napas",             # nappas -> napas
    (2, 13): "gemetaran",        # kebetaran -> gemetaran
    (2, 16): "merogoh",          # meruguh -> merogoh
    (2, 18): "jaket",            # jake -> jaket
    (2, 20): "Dia",              # Dia, -> Dia
    (2, 21): "nemu",             # namun -> nemu
    (2, 23): "koin",             # uangkuin -> koin
    (2, 28): "buru-",            # buruk -> buru-
    (2, 29): "buru",             # -buru -> buru
    (2, 31): "sehelai",          # sekalai -> sehelai
    (2, 36): "bebatuan.",        # babatuan. -> bebatuan.
    (2, 47): "ngelempar",        # nglempar -> ngelempar
    (2, 55): "lirih:",           # -liri. -> lirih:
    (2, 56): "Permisi...",       # Berbisih, -> Permisi...
    (2, 59): "daun",             # don -> daun
    (2, 61): "ya,",              # yang -> ya,
    (2, 62): "mbah.",            # bah, -> mbah.
    (2, 65): "riuh",             # riyuh -> riuh

    # Segment 3
    (3, 1): "lenyap...",         # linyap. -> lenyap...
    (3, 2): "digantikan",        # Degantikan, -> digantikan
    (3, 4): "hembusan",          # hampusan -> hembusan
    (3, 17): "di kejauhan,",     # dikejauhan, -> di kejauhan,
    (3, 22): "senter",           # center -> senter
    (3, 23): "temannya",         # temennya -> temannya

    # Segment 4
    (4, 1): "histeris,",         # hysteris, -> histeris,
    (4, 2): "manggil-",          # mangil -> manggil-
    (4, 3): "manggil",           # -manggil -> manggil
    (4, 4): "nama",              # namar -> nama
    (4, 8): "kawan-",            # kawan -> kawan-
    (4, 9): "kawan.",            # -kawan. -> kawan.

    # Segment 5
    (5, 17): "Gunung",           # gunung -> Gunung
    (5, 18): "Lawu?",            # lawu, -> Lawu?
    (5, 19): "Tulis",            # tulis -> Tulis

    # Segment 6
    (6, 1): "komentar!",         # komentar. -> komentar!
}

# Apply to words
for seg in data['segments']:
    seg_id = seg['id']
    for w in seg['words']:
        w_no = w['no']
        if (seg_id, w_no) in corrections:
            old = w['word']
            new = corrections[(seg_id, w_no)]
            print(f"Seg {seg_id} Word {w_no}: '{old}' -> '{new}'")
            w['word'] = new

# Also update clean segment text
clean_texts = {
    1: "Di part satu kemarin, Raka membeku di sabana Pos Lima Gunung Lawu, setelah napas dingin berhembus di tengkuknya dan suara misterius berbisik persis di belakang telinganya. Mas, mau beli apa? Jujur aja, siapa pun di posisi itu pasti refleks pengen langsung lari sekencang-kencangnya. Tapi sedetik sebelum kakinya melangkah, Raka mendadak teringat pesan wanti-wanti pendaki senior pas di basecamp. Kalau kamu mendengar suara transaksi di Pasar Setan, jangan pernah sombong, dan jangan pernah lari panik, atau...",
    2: "kamu bakal tersesat selamanya di dimensi lain. Dengan napas tercekat dan tangan gemetaran hebat, Raka merogoh kantong jaket tebalnya. Dia nemu sekeping uang koin lima ratus perak, lalu buru-buru memungut sehelai daun kering dari tanah bebatuan. Sambil menunduk tanpa berani nengok ke belakang sedikit pun, Raka ngelempar koin itu ke arah kabut dan berbisik lirih: Permisi... saya beli daun ini ya, mbah. Seketika, suara riuh pasar dan alunan gamelan tadi mendadak...",
    3: "lenyap... digantikan suara hembusan angin gunung yang dingin menusuk tulang. Perlahan, kabut pekat mulai tersapu. Dan di kejauhan, tampak dua titik cahaya senter temannya yang...",
    4: "histeris manggil-manggil nama Raka. Raka selamat, kawan-kawan. Tapi pas dia ngecek tanah tempat dia berdiri, koin yang tadi dia lempar...",
    5: "udah berubah jadi batu kerikil hitam legam. Menurut kalian, siapa sebenarnya sosok yang jualan di kabut Gunung Lawu? Tulis di kolom...",
    6: "komentar!"
}

for seg in data['segments']:
    if seg['id'] in clean_texts:
        seg['text'] = clean_texts[seg['id']]

out_path = 'C:/Users/Lenovo/.gemini/antigravity/scratch/alphastorytime-studio/part2_word_timestamps_fixed.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\nSUCCESS: All typos corrected and saved to part2_word_timestamps_fixed.json!")
