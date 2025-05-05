/**
 * Lista de palabras prohibidas para filtrar en mensajes de chat
 * Las palabras están organizadas en categorías para facilitar su mantenimiento
 */

const forbiddenWords = {
  insultos: [
    "idiota",
    "tonto",
    "estupido",
    "imbecil",
    "pendejo",
    "tarado",
    "inutil",
    "bobo",
    "payaso",
    "burro",
    "animal",
    "perdedor",
    "fracasado",
    "torpe",
    "baboso",
    "memo",
    "gil",
  ],
  groserías: [
    "mierda",
    "puta",
    "carajo",
    "joder",
    "coño",
    "verga",
    "culo",
    "cagar",
    "chingar",
    "follar",
    "polla",
    "capullo",
    "gilipollas",
    "cabrón",
    "puto",
    "pedo",
    "mamon",
    "concha",
  ],
  discriminación: [
    "negro",
    "marica",
    "puto",
    "retrasado",
    "mongolo",
    "sudaca",
    "gitano",
    "moro",
    "indio",
    "gallego",
    "tortillera",
    "maricón",
    "travelo",
    "emigrante",
    "sudaca",
    "gabacho",
    "guiri",
    "podemita",
    "facha",
  ],
  // Palabras sensibles en inglés
  englishOffensive: [
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "cunt",
    "dick",
    "idiot",
    "moron",
    "retard",
    "slut",
    "pussy",
    "whore",
    "cock",
    "bastard",
    "twat",
    "jerk",
    "douche",
    "prick",
    "wanker",
    "motherfucker",
    "bullshit",
    "nigger",
    "faggot",
  ],
  // Nuevas categorías
  amenazas: [
    "matar",
    "golpear",
    "violar",
    "asesinar",
    "cortar",
    "pegar",
    "ahorcar",
    "apuñalar",
    "exterminar",
    "dañar",
    "quemar",
    "torturar",
  ],
  bullyingEscolar: [
    "nerd",
    "empollón",
    "gafotas",
    "gordo",
    "feo",
    "gorda",
    "fea",
    "cuatro ojos",
    "listillo",
    "sabiondo",
    "marginado",
    "solitario",
  ],
  drogas: [
    "coca",
    "heroína",
    "crack",
    "cristal",
    "metanfetamina",
    "farlopa",
    "jaco",
    "costo",
    "maría",
    "porros",
    "esnifar",
    "pincharse",
    "camello",
  ],
};

/**
 * Obtiene un array plano con todas las palabras prohibidas
 * @returns {Array<string>} Lista completa de palabras prohibidas
 */
const getAllForbiddenWords = () => {
  return Object.values(forbiddenWords).flat();
};

/**
 * Verifica si un texto contiene palabras prohibidas
 * @param {string} text - El texto a verificar
 * @returns {boolean} - True si contiene palabras prohibidas, false en caso contrario
 */
const containsForbiddenWords = (text) => {
  if (!text || typeof text !== "string") return false;

  const lowercaseText = text.toLowerCase();
  const allWords = getAllForbiddenWords();

  return allWords.some((word) => lowercaseText.includes(word));
};

/**
 * Censura las palabras prohibidas en un texto
 * @param {string} text - El texto a censurar
 * @returns {string} - Texto con palabras prohibidas censuradas
 */
const censorText = (text) => {
  if (!text || typeof text !== "string") return text;

  let censoredText = text.toLowerCase();
  const allWords = getAllForbiddenWords();

  allWords.forEach((word) => {
    if (censoredText.includes(word)) {
      // Crear un reemplazo con asteriscos de la misma longitud que la palabra
      const censored = "*".repeat(word.length);

      // Reemplazar todas las ocurrencias de la palabra usando una expresión regular
      // para asegurarse de capturar la palabra completa
      const regex = new RegExp(word, "gi");
      censoredText = censoredText.replace(regex, censored);
    }
  });

  return censoredText;
};

module.exports = {
  forbiddenWords,
  getAllForbiddenWords,
  containsForbiddenWords,
  censorText,
};
