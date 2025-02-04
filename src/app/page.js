'use client';

import { useState } from 'react';
import axios from 'axios';
// import { button } from '@/components/ui/button';
import { PulseLoader } from 'react-spinners'; // 👈 Loading spinner
import namer from 'color-namer';

export default function StyleExtractor() {
  const [url, setUrl] = useState('');
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 Loading state

  const fetchStyles = async () => {
    setColors([]);
    setLoading(true);

    try {
      const response = await axios.get(
        `/api/extractStyles?url=${encodeURIComponent(url)}`
      );
      const colorData = response.data.colors.map((color) => {
        const name = namer(color).ntc[0].name; // Get the closest color name
        return { name, value: color };
      });

      setColors(colorData);
    } catch (error) {
      console.error('Error fetching styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    const colorJson = colors.reduce((acc, color) => {
      acc[color.name.toLowerCase()] = color.value;
      return acc;
    }, {});

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(colorJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = dataStr;
    downloadAnchor.download = 'styles.json';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const getTextColor = (bgColor) => {
    const rgb = bgColor.match(/\d+/g);
    if (!rgb) return '#000';
    const brightness =
      (parseInt(rgb[0]) * 299 +
        parseInt(rgb[1]) * 587 +
        parseInt(rgb[2]) * 114) /
      1000;
    return brightness > 125 ? '#000' : '#fff';
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Extract Webpage Styles</h1>

      <input
        type="text"
        className="border p-2 w-full rounded mb-4 text-gray-800" // 👈 Darker input text
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onFocus={(e) => e.target.select()} // 👈 Auto-select on focus
      />

      <button
        onClick={fetchStyles}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Extract Styles
      </button>

      {loading && (
        <div className="flex justify-center mt-4">
          <PulseLoader color="#3498db" />
        </div>
      )}

      {colors.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Extracted Colors</h2>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="p-4 rounded shadow text-center"
                style={{
                  backgroundColor: color.value,
                  color: getTextColor(color.value),
                }} // 👈 Adjust text color
              >
                <p className="font-bold">{color.name}</p>
                <p>{color.value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={downloadJSON}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Download JSON
          </button>
        </div>
      )}
    </div>
  );
}
