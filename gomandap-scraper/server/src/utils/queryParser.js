const STOP_WORDS = [
  "i", "want", "looking", "for", "find", "me", "some", "best", "good", "cheap", 
  "top", "rated", "can", "you", "search", "show", "get", "need", "a", "an", "the", "are", "is", "am", "to"
];

/**
 * Strips fluff words and splits intent. Does NOT restrict search terms.
 * @param {string} rawQuery - The natural language query from the user
 * @returns {{category: string, location: string, correctedQuery: string}}
 */
function parseNaturalLanguageQuery(rawQuery) {
  if (!rawQuery) return { category: '', location: '', correctedQuery: '' };

  let cleanText = rawQuery.toLowerCase().trim();

  // 1. Remove stopwords
  const words = cleanText.split(/\s+/);
  const filteredWords = words.filter(w => !STOP_WORDS.includes(w));
  cleanText = filteredWords.join(' ');

  // 2. Split on geographic prepositions
  const prepRegex = /\s+(in|near|at|around)\s+/i;
  const match = cleanText.match(prepRegex);

  let rawCategory = cleanText;
  let rawLocation = '';

  if (match) {
    const splitIndex = match.index;
    rawCategory = cleanText.substring(0, splitIndex).trim();
    rawLocation = cleanText.substring(splitIndex + match[0].length).trim();
  }

  // Pass Category and Location exactly as typed to allow infinite flexibility!
  let finalCategory = rawCategory;
  let finalLocation = rawLocation;

  return {
    category: finalCategory,
    location: finalLocation,
    correctedQuery: `${finalCategory} ${rawLocation ? 'in ' + finalLocation : ''}`.trim()
  };
}

module.exports = {
  parseNaturalLanguageQuery
};
