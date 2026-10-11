'use strict';
// Bound compiler thread pools before native bindings initialize on shared hosting.
const {spawn}=require('node:child_process');
const child=spawn(process.execPath,['--max-old-space-size=1536',require.resolve('next/dist/bin/next'),'build','--webpack'],{
  stdio:'inherit',env:{...process.env,RAYON_NUM_THREADS:'1',UV_THREADPOOL_SIZE:'2',NEXT_TELEMETRY_DISABLED:'1'}
});
child.on('error',error=>{console.error('Build could not start:',error.message);process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=code===null?1:code; if(signal)console.error('Build interrupted:',signal);});
