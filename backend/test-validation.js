const testPuzzle1 = {
    type: 'logical_chain',
    difficulty: 3,
    startWord: 'water',
    endWord: 'electricity',
    steps: [
        { word: 'dam', options: ['dam', 'lake', 'river', 'ocean'] },
        { word: 'turbine', options: ['turbine', 'wheel', 'boat', 'fish'] },
        { word: 'generator', options: ['generator', 'battery', 'lamp', 'wire'] },
        { word: 'power', options: ['power', 'energy', 'force', 'light'] }
    ],
    hint: 'Think about renewable energy',
    puzzleId: 'db-en-l3-1'
};

// Simulated validation
const hasArabicLetters = (s) => /[\u0600-\u06FF]/.test(String(s ?? ''));
const normalize = (s) => String(s ?? '').trim().toLowerCase();
const isArabic = false; // English request
const level = 3;

// Check start/end
console.log('Start:', testPuzzle1.startWord, 'Has Arabic?', hasArabicLetters(testPuzzle1.startWord));
console.log('End:', testPuzzle1.endWord, 'Has Arabic?', hasArabicLetters(testPuzzle1.endWord));

// Check if failing English validation
if (!isArabic && testPuzzle1.startWord && testPuzzle1.endWord) {
    if (hasArabicLetters(testPuzzle1.startWord) && hasArabicLetters(testPuzzle1.endWord)) {
        console.log('❌ Would REJECT - Both start/end have Arabic');
    } else {
        console.log('✅ PASS - Not purely Arabic');
    }
}

// Check steps
for (const s of testPuzzle1.steps) {
    const w = s.word.trim();
    console.log(`Step: "${w}", Has Arabic? ${hasArabicLetters(w)}, Has English? ${/[a-zA-Z]/.test(w)}`);

    if (isArabic && w && !hasArabicLetters(w) && /[a-zA-Z]/.test(w)) {
        console.log(`  ❌ Would REJECT (Arabic request but English word)`);
    } else if (!isArabic && w && hasArabicLetters(w)) {
        console.log(`  ❌ Would REJECT (English request but Arabic word)`);
    } else {
        console.log(`  ✅ PASS`);
    }
}
