function formatFatalities(data) {
    const formatted = {};

    data.forEach(group => {
        formatted[group.ageGroup] = {
            males: group.Males || 0,
            females: group.Females || 0
        };
    });

    return formatted;
}

module.exports = {
    formatFatalities
};