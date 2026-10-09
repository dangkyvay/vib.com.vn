<template>
  <div id="ekyc_sdk_intergrated"></div>
</template>

<script>
import { onMounted } from 'vue';

export default {
  name: 'Ekyc',
  setup() {
    onMounted(async () => {
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
        window.ekycsdk.init(initObj, (res) => {
          if (res.error) {
            console.error('Lỗi SDK:', res.error);
          } else {
            console.log('Kết quả:', res);
            window.ekycsdk.viewResult(res.type_document, res);
          }
        });
      };
    });
  },
};
</script>

<style scoped>
/* Thêm kiểu CSS nếu cần */
</style>
