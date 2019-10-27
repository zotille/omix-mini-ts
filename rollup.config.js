import typescript from 'rollup-plugin-typescript2'
// import resolve from 'rollup-plugin-node-resolve'
// import builtins from 'rollup-plugin-node-builtins'
// import babel from 'rollup-plugin-babel'
// import json from 'rollup-plugin-json'
// import { uglify } from 'rollup-plugin-uglify'
// import commonjs from 'rollup-plugin-commonjs'


export default {
  input: './src/index.ts',
  output: {
    file: './miniprogram/dist/index.js',
    name: 'omix_mini',
    format: 'umd',
    exports: 'named'
  },

  plugins: [
    typescript(),
  ]
}