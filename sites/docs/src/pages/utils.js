// export function addStudyIdToConfig(configString, studyId) {
//     const jsonConfig = JSON.parse(configString, null, 2);
//     jsonConfig.studyId = studyId;
//     return JSON.stringify(jsonConfig);
// }


// export default function isValidUrl(string) {
//   const urlPattern = new RegExp(
//     '^(https?:\\/\\/)?' // protocol
//       + '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.?)+[a-zA-Z]{2,}|(\\d{1,3}\\.){3}\\d{1,3})' // domain name and extension
//       + '(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*' // port and path
//       + '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?' // query string
//       + '(\\#[-a-zA-Z\\d_]*)?$', 'i', // fragment locator
//   );
//   return !!urlPattern.test(string);
// }

// export async function getLinkId(LINK_ID_URL, studyId, setError) {
//   const url = `${LINK_ID_URL}${studyId}`;
//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//     });

//     if (!response.ok) {
//       setError('Error reading the LinkId');
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json(); // Assuming the response is JSON. Adjust as needed.
//     return data;
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     setError('Error reading the LinkId');
//   }
// }
