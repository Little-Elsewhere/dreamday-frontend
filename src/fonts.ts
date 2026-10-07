import localFont from 'next/font/local'

export const beVietnamPro = localFont({
  src: [
    { path: '../public/fonts/BeVietnamPro-Thin.ttf', weight: '100' },
    { path: '../public/fonts/BeVietnamPro-ThinItalic.ttf', weight: '100', style: 'italic' },
    { path: '../public/fonts/BeVietnamPro-ExtraLight.ttf', weight: '200' },
    {
      path: '../public/fonts/BeVietnamPro-ExtraLightItalic.ttf',
      weight: '200',
      style: 'italic',
    },
    { path: '../public/fonts/BeVietnamPro-Light.ttf', weight: '300' },
    { path: '../public/fonts/BeVietnamPro-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../public/fonts/BeVietnamPro-Regular.ttf', weight: '400' },
    { path: '../public/fonts/BeVietnamPro-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/BeVietnamPro-Medium.ttf', weight: '500' },
    {
      path: '../public/fonts/BeVietnamPro-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    { path: '../public/fonts/BeVietnamPro-SemiBold.ttf', weight: '600' },
    {
      path: '../public/fonts/BeVietnamPro-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    { path: '../public/fonts/BeVietnamPro-Bold.ttf', weight: '700' },
    { path: '../public/fonts/BeVietnamPro-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../public/fonts/BeVietnamPro-ExtraBold.ttf', weight: '800' },
    {
      path: '../public/fonts/BeVietnamPro-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },
    { path: '../public/fonts/BeVietnamPro-Black.ttf', weight: '900' },
    { path: '../public/fonts/BeVietnamPro-BlackItalic.ttf', weight: '900', style: 'italic' },
  ],
  display: 'swap',
  preload: false,
  variable: '--font-be-vietnam-pro',
})
