export default class uploader {
  getRandomString()
  {
    let result = [];
    let currentTime = new Date();
    const zeroRepair = (num, length = 2) => (Array(length).join('0') + num).slice(-length);
    result.push(currentTime.getFullYear());
    result.push(zeroRepair(currentTime.getMonth() + 1));
    result.push(zeroRepair(currentTime.getDate()));
    result.push(zeroRepair(currentTime.getHours()));
    result.push(zeroRepair(currentTime.getMinutes()));
    result.push(zeroRepair(currentTime.getSeconds()));
    result.push(zeroRepair(currentTime.getMilliseconds(), 3));
    result.push(zeroRepair(Math.floor(Math.random() * 100000000000), 11));
    return result.join('');
  };

  upload(file, progressCallBack, doneCallBack, errorCallBack)
  {
    if (this.uploading == false)
    {
      this.uploading = true;
      let fileSize = file.size;
      let chunkSize = this.chunkSize;
      let chunkCount = Math.floor(fileSize / chunkSize);
      let chunkCurrentIndex = 0;
      let chunkParam = '';
      let randomString = this.getRandomString();
      const chunkUpload = () => {
        if (chunkCurrentIndex <= chunkCount)
        {
          let fileStart = chunkCurrentIndex * chunkSize;
          let fileEnd = Math.min(fileSize, fileStart + chunkSize);
          let formData = new FormData();
          formData.append('file', file.slice(fileStart, fileEnd), file.name);
          formData.append('fileSize', fileSize);
          formData.append('chunkCount', chunkCount);
          formData.append('chunkCurrentIndex', chunkCurrentIndex);
          formData.append('chunkParam', chunkParam);
          formData.append('randomString', randomString);
          let httpRequest = new XMLHttpRequest();
          httpRequest.upload.addEventListener('progress', function(e){
            progressCallBack(Math.round(chunkCurrentIndex / (chunkCount + 1) * 100 + (1 / (chunkCount + 1)) * Math.round(e.loaded / e.total) * 100));
          }, false);
          httpRequest.addEventListener('load', function(e){
            let target = e.target;
            if (target.status == 200)
            {
              let data = JSON.parse(target.responseText);
              if (data.code == -1)
              {
                chunkCurrentIndex += 1;
                chunkParam = JSON.stringify(data.param);
                chunkUpload();
              }
              else
              {
                doneCallBack(data);
                this.uploading = false;
              };
            }
            else
            {
              errorCallBack(target);
            };
          }, false);
          httpRequest.open('POST', this.action);
          httpRequest.send(formData);
        };
      };
      chunkUpload();
    };
  };

  constructor(action, chunkSize = 2097152) {
    this.action = action;
    this.chunkSize = chunkSize;
    this.uploading = false;
  };
};