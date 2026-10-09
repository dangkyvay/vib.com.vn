import { Component, OnInit } from '@angular/core';

declare var ekycsdk: any;
declare var FaceVNPTBrowserSDK: any;

@Component({
  selector: 'app-abc',
  templateUrl: './abc.component.html',
})
export class AbcComponent implements OnInit {
  ngOnInit(): void {
    this.loadEkycSDK();
  }

  loadEkycSDK(): void {
    const script = document.createElement('script');
    script.src = './ekyc-web-sdk-2.1.0.js';
    script.async = true;
    script.onerror = () => console.error('Không thể tải SDK eKYC');
    document.head.appendChild(script);

    script.onload = async () => {
      await FaceVNPTBrowserSDK.init();
      const initObj = {
        BACKEND_URL: 'https://your-backend-url.com',
        TOKEN_KEY: 'your-token-key',
        TOKEN_ID: 'your-token-id',
        AUTHORIZATION: 'your-authorization-token',
        PARRENT_ID: 'ekyc_sdk_intergrated',
      };
      ekycsdk.init(initObj, (res: any) => {
        if (res.error) {
          console.error('Lỗi SDK:', res.error);
        } else {
          console.log('Kết quả:', res);
          ekycsdk.viewResult(res.type_document, res);
        }
      });
    };
  }
}
