# omix-mini-ts

自己在用的小程序结构

## 特点

### 使用TS编程

因为在做的小程序都比较重，包含大量的数据交互，使用js会出现写着写着不知道数据的格式是什么、类型出现错误(昨天还遇到string和numbe隐转问题)；使用TS可以有效规避这些问题；
但是小程序提供的ts脚手架项目其实也就是简单的tsc，而且需要手动tsc... tsc -watch 还是很香的...

### 使用less

参考wxss-cli，使用chokidar进行文件监测，编译less ...

### 安装依赖，启动监测

npm i
npm start ..
