export default function isValidUrl(string) {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.?)+[a-zA-Z]{2,}|(\\d{1,3}\\.){3}\\d{1,3})' + // domain name and extension
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*' + // port and path
      '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?' + // query string
      '(\\#[-a-zA-Z\\d_]*)?$', 'i' // fragment locator
    );
    return !!urlPattern.test(string);
    
  };