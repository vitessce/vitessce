import React from 'react';
import FileDrop from 'react-file-drop';
import PropTypes from 'prop-types';


export default class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileNames: [],
    };

    this.handleDrop = this.handleDrop.bind(this);
  }

  handleDrop(files) {
    const { fileNames } = this.state;
    const fileNamesCopy = fileNames.slice();
    for (const f of files) {
      if (!fileNamesCopy.includes(f.name)) {
        // Do not add duplicate entries to list...
        fileNamesCopy.push(f.name);
      }
      // ... but we do update the data.
      // This is easy, and good enough for now.
      this.props.onAddFile(f);
    }
    this.setState({ fileNames: fileNamesCopy });
  }

  render() {
    const { fileNames } = this.state;
    const fileList = fileNames.map(
      fileName => <li className="list-group-item" key={fileName}>{fileName}</li>,
    );

    const message = fileList.length
      ? <ul className="list-group">{fileList}</ul>
      : 'Drop files here';
    return (
      <div>
        <FileDrop onDrop={this.handleDrop}>
          {message}
        </FileDrop>
      </div>
    );
  }
}

FileManager.propTypes = {
  onAddFile: PropTypes.func,
};
