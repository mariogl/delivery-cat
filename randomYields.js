const yields = ["Achtung!", "Oju eh?", "EH!", "Eeeooo!", "PSSST!"];

const getRandomYield = () => yields[Math.floor(Math.random() * yields.length)];

module.exports = getRandomYield;
