function storageEncode(url) {
    url = url.split('/').join('%2F');
    url = url + '?alt=media';

    return url;
}

module.exports = {
    storageEncode
};