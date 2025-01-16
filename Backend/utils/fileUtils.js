import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Papa from 'papaparse';

// Select, parse, and handle CSV file
export const selectAndParseCSV = async (onSuccess, onError) => {
  try {
    const res = await DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] });
    const { uri } = res[0];

    if (!uri) throw new Error('No URI found in the selected file');

    const fileContent = await RNFS.readFile(uri, 'utf8');
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        const validData = result.data.filter(
          item => item.name && item.url && item.username && item.password,
        );
        onSuccess(validData);
      },
      error: onError,
    });
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User canceled the picker');
    } else {
      onError(err);
    }
  }
};