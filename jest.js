const transformIgnorePatterns = [
  '/dist/',
  'node_modules/[^/]+?/(?!(es|node_modules)/)',
];

module.exports = {
  // verbose: true,
  // logHeapUsage: true,
  preset: 'ts-jest',
  setupFiles: [
    '<rootDir>/__jest__/raf_polyfill.js',
    '<rootDir>/__jest__/setup.js',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__jest__/fileMock.js',
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy', // for css module
  },
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'ts',
    'tsx',
  ],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  transformIgnorePatterns,
  transform: {
    '^.+\\.([jt])sx?$': 'babel-jest',
  },
};
