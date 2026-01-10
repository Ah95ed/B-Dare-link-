/**
 * Puzzle Validation Module - STRICT VERSION
 * Ensures high-quality puzzle generation from AI models
 * Zero tolerance for language mixing and encoding issues
 */

// Check if text contains garbled or corrupted characters
function hasCorruptedText(text) {
    if (!text) return false;

    // Check for isolated Latin letters followed by Arabic (likely corruption)
    if (/[a-zA-Z][\u0600-\u06FF]|[\u0600-\u06FF][a-zA-Z]/.test(text)) {
        return true;
    }

    // Check for unusual character sequences that indicate corruption
    if (/[\u0600-\u06FF]{1}[a-zA-Z]{1}[\u0600-\u06FF]/.test(text)) {
        return true;
    }

    // Check for repeated special characters indicating encoding issues
    if (/[\u064B-\u0652]{2,}/.test(text)) {
        return true;
    }

    return false;
}

// STRICT: Check if text is pure Arabic with no Latin mixing whatsoever
function hasLanguageMixing(text) {
    if (!text) return false;

    const arabicCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

    // ZERO TOLERANCE: even 1 Latin letter in Arabic text = mixing
    if (arabicCount > 0 && latinCount > 0) {
        return true; // ANY mixing is rejected
    }

    return false;
}

// Sanitize common Arabic spelling errors
function sanitizeArabicText(text) {
    if (!text) return text;

    let sanitized = text;

    // Fix common mistakes
    // تاء مربوطة in wrong places
    sanitized = sanitized.replace(/ــة\b/g, 'ـة');

    // Multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
}

// STRICT: Check if text is valid for the given language
function validateLanguage(text, language) {
    if (!text) return { valid: false, error: 'Empty text' };

    // Check for corruption first (highest priority)
    if (hasCorruptedText(text)) {
        return { valid: false, error: 'Text appears corrupted or contains invalid character encoding' };
    }

    if (language === 'ar') {
        // ZERO TOLERANCE for any Latin mixing
        if (hasLanguageMixing(text)) {
            return { valid: false, error: 'STRICT: Language mixing detected - only Arabic allowed' };
        }

        // Check if text is mostly Arabic (at least 85%)
        const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
        const totalChars = text.replace(/\s/g, '').length;
        const arabicRatio = arabicChars / totalChars;

        if (arabicRatio < 0.85) {
            return { valid: false, error: `Only ${(arabicRatio * 100).toFixed(0)}% Arabic characters - need at least 85%` };
        }

        // Check for valid Arabic diacritics (not corrupted)
        const diacritics = (text.match(/[\u064B-\u0652]/g) || []).length;
        const validDiacriticRatio = diacritics / totalChars;
        if (validDiacriticRatio > 0.1) { // More than 10% diacritics = likely corruption
            return { valid: false, error: 'Too many diacritical marks - likely corrupted text' };
        }
    } else if (language === 'en') {
        // For English, strictly no Arabic
        const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
        if (arabicChars > 0) {
            return { valid: false, error: 'STRICT: No Arabic characters allowed in English text' };
        }
    }

    return { valid: true };
}

// Validate puzzle JSON structure and content
export function validatePuzzle(puzzle, language = 'en', options = {}) {
    const errors = [];
    const warnings = [];

    if (!puzzle || typeof puzzle !== 'object') {
        return { valid: false, errors: ['Puzzle is not a valid object'] };
    }

    // Check required fields
    if (!puzzle.question) {
        errors.push('Missing question field');
    }

    if (!Array.isArray(puzzle.options) || puzzle.options.length < 2) {
        errors.push('Options must be an array with at least 2 items');
    }

    if (puzzle.correctIndex === undefined || puzzle.correctIndex === null) {
        errors.push('Missing correctIndex field');
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Validate question language and content
    const qValidation = validateLanguage(puzzle.question, language);
    if (!qValidation.valid) {
        errors.push(`Question error: ${qValidation.error}`);
    }

    // Check question length (must be reasonable)
    if (puzzle.question.length < 10) {
        errors.push('Question is too short');
    }
    if (puzzle.question.length > 500) {
        errors.push('Question is too long');
    }

    // Validate correctIndex is in valid range
    const cidx = Number(puzzle.correctIndex);
    if (!Number.isInteger(cidx) || cidx < 0 || cidx >= puzzle.options.length) {
        errors.push(`correctIndex ${cidx} is out of range [0, ${puzzle.options.length - 1}]`);
    }

    // Validate options
    const optionSet = new Set();
    puzzle.options.forEach((opt, idx) => {
        // Check language
        const optValidation = validateLanguage(opt, language);
        if (!optValidation.valid) {
            errors.push(`Option ${idx} error: ${optValidation.error}`);
        }

        // Check length
        if (opt.length < 2) {
            errors.push(`Option ${idx} is too short`);
        }
        if (opt.length > 200) {
            errors.push(`Option ${idx} is too long`);
        }

        // Check for duplicates (case-insensitive)
        const normalizedOpt = opt.toLowerCase().trim();
        if (optionSet.has(normalizedOpt)) {
            errors.push(`Option ${idx} is a duplicate`);
        }
        optionSet.add(normalizedOpt);
    });

    // Validate hint (optional but helpful)
    if (puzzle.hint) {
        if (typeof puzzle.hint !== 'string') {
            errors.push('Hint must be a string');
        }
        const hintValidation = validateLanguage(puzzle.hint, language);
        if (!hintValidation.valid) {
            warnings.push(`Hint language issue: ${hintValidation.error}`);
        }
    }

    // Validate correct answer is actually in options
    if (cidx >= 0 && cidx < puzzle.options.length) {
        const correctAnswer = puzzle.options[cidx];
        if (!correctAnswer || correctAnswer.trim().length === 0) {
            errors.push('Correct answer is empty');
        }
    }

    // For Wonder Link puzzles, validate pair structure
    if (puzzle.category === 'wonder_link' && puzzle.pair) {
        if (!puzzle.pair.a || !puzzle.pair.b) {
            warnings.push('Wonder Link puzzle missing pair information');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
            questionLength: puzzle.question?.length || 0,
            optionCount: puzzle.options?.length || 0,
            hasHint: !!puzzle.hint,
            hasExplanation: !!puzzle.explanation,
            category: puzzle.category || 'unknown',
        }
    };
}

// Sanitize puzzle by cleaning up common issues
export function sanitizePuzzle(puzzle) {
    if (!puzzle || typeof puzzle !== 'object') {
        return puzzle;
    }

    const sanitized = { ...puzzle };

    // Sanitize question
    if (sanitized.question && typeof sanitized.question === 'string') {
        sanitized.question = sanitizeArabicText(sanitized.question).trim();
    }

    // Sanitize options
    if (Array.isArray(sanitized.options)) {
        sanitized.options = sanitized.options.map(opt => {
            if (typeof opt === 'string') {
                return sanitizeArabicText(opt).trim();
            }
            return opt;
        });
    }

    // Sanitize hint
    if (sanitized.hint && typeof sanitized.hint === 'string') {
        sanitized.hint = sanitizeArabicText(sanitized.hint).trim();
    }

    // Sanitize explanation
    if (sanitized.explanation && typeof sanitized.explanation === 'string') {
        sanitized.explanation = sanitizeArabicText(sanitized.explanation).trim();
    }

    return sanitized;
}

// Check if a puzzle passes strict quality requirements
export function isHighQuality(puzzle, language = 'en') {
    const validation = validatePuzzle(puzzle, language);

    // Must have no errors
    if (!validation.valid) {
        return false;
    }

    // Quality checks
    const q = puzzle.question || '';
    const opts = puzzle.options || [];

    // Question should be reasonably long and complex
    if (q.length < 15 || q.length > 300) {
        return false;
    }

    // All options should be reasonably diverse in length
    const optLengths = opts.map(o => (o || '').length);
    const avgLen = optLengths.reduce((a, b) => a + b, 0) / optLengths.length;
    const maxDiff = Math.max(...optLengths) - Math.min(...optLengths);

    // If max difference is too large, options are probably not balanced
    if (maxDiff > avgLen * 2) {
        return false;
    }

    // Should have hint for better UX
    if (!puzzle.hint) {
        return false;
    }

    return true;
}

// Rate puzzle quality on a scale of 0-100
// CRITICAL: Very strict - low quality puzzles get low scores
export function ratePuzzleQuality(puzzle, language = 'en') {
    let score = 100;
    const validation = validatePuzzle(puzzle, language);

    // CRITICAL: Deduct heavily for any errors
    if (!validation.valid) {
        // Any validation error = MASSIVE deduction
        const errorDeduction = 50 + validation.errors.length * 15;
        const finalScore = Math.max(0, score - errorDeduction);
        console.log(`[VALIDATOR] Quality score ${finalScore}: ${validation.errors.join('; ')}`);
        return finalScore;
    }

    // Deduct for warnings (which indicate potential quality issues)
    score -= validation.warnings.length * 8;

    // Check question quality
    const q = puzzle.question || '';

    // Question too short or too long
    if (q.length < 10) {
        score -= 25;
        console.log(`[VALIDATOR] Question too short (${q.length} chars)`);
    }
    if (q.length > 400) {
        score -= 25;
        console.log(`[VALIDATOR] Question too long (${q.length} chars)`);
    }

    // Check if question looks corrupted (repeated chars, weird patterns)
    const repeatedChars = (q.match(/(.)\1{3,}/g) || []).length;
    if (repeatedChars > 0) {
        score -= repeatedChars * 10;
        console.log(`[VALIDATOR] Found ${repeatedChars} repeated character sequences`);
    }

    // Check option quality - STRICT
    const opts = puzzle.options || [];

    if (opts.length !== 4) {
        score -= 15;
        console.log(`[VALIDATOR] Expected 4 options, got ${opts.length}`);
    }

    // Check each option for quality
    opts.forEach((opt, idx) => {
        const o = opt || '';

        // Too short or too long
        if (o.length < 2) {
            score -= 15;
            console.log(`[VALIDATOR] Option ${idx} too short`);
        }
        if (o.length > 250) {
            score -= 15;
            console.log(`[VALIDATOR] Option ${idx} too long`);
        }

        // Check for corruption patterns
        const repeats = (o.match(/(.)\1{2,}/g) || []).length;
        if (repeats > 0) {
            score -= repeats * 12;
            console.log(`[VALIDATOR] Option ${idx} has repeated chars: ${repeats}`);
        }

        // Check for suspicious patterns (likely corruption)
        const suspiciousPatterns = (o.match(/[?!]{2,}|\.{3,}/g) || []).length;
        if (suspiciousPatterns > 0) {
            score -= suspiciousPatterns * 15;
            console.log(`[VALIDATOR] Option ${idx} has suspicious patterns`);
        }
    });

    // Check option diversity in length (balanced options)
    const optLengths = opts.map(o => (o || '').length);
    if (optLengths.length > 1) {
        const avgLen = optLengths.reduce((a, b) => a + b, 0) / optLengths.length;
        const maxDiff = Math.max(...optLengths) - Math.min(...optLengths);

        // Very strict: options should be roughly similar length
        if (maxDiff > avgLen * 1.5) {
            score -= 20;
            console.log(`[VALIDATOR] Options too different in length (diff: ${maxDiff}, avg: ${avgLen})`);
        }
    }

    // Check correctIndex validity
    const cidx = Number(puzzle.correctIndex);
    if (!Number.isInteger(cidx) || cidx < 0 || cidx >= opts.length) {
        score -= 40;
        console.log(`[VALIDATOR] Invalid correctIndex: ${cidx}`);
    }

    // Bonus for having good metadata (but not enough to override bad content)
    if (puzzle.hint) score += 5;
    if (puzzle.explanation) score += 5;
    if (puzzle.category) score += 3;

    const finalScore = Math.max(0, Math.min(100, score));

    if (finalScore < 75) {
        console.log(`[VALIDATOR] LOW QUALITY PUZZLE - Score: ${finalScore}/100`);
    }

    return finalScore;
}
