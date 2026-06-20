import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // App ID theo định dạng reverse domain (thay đổi theo tên tổ chức của bạn)
  appId: 'vn.gov.criminal.records',
  // Tên hiển thị trên thiết bị Android
  appName: 'Quản Lý Đối Tượng',
  // Thư mục chứa output của Next.js static export
  webDir: 'out',
  server: {
    // Cho phép kết nối đến backend server (bỏ giới hạn HTTPS trong debug)
    cleartext: true,
    androidScheme: 'http',
  },
  android: {
    // Build config cho Android
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
