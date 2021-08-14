/**
 * 
 * @returns 
 */
 function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return `${day}-${month}-${year}`;
}

/**
 * 
 * @param {*} text 
 * @returns 
 */
function removeFormat(text) {
    const strings = [',', '"', '*'];

    strings.forEach(string => {
        text = text.replaceAll(string, '');
    });

    return text;
}

function extractDate(stringDate) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const split = stringDate.split(' ');

    const date = split[1];
    const month = months.indexOf(split[2]) + 1;
    const year = split[3];

    return `${date}/${month}/${year}`;
}

module.exports = {
    getFormattedDate,
    removeFormat,
    extractDate
}