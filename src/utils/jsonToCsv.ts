// utils/csvUtils.ts
import Papa from 'papaparse';

const convertJsonToCsv = (jsonArray: any[], fileName: string) => {
  const csv = Papa.unparse(jsonArray);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default convertJsonToCsv;
