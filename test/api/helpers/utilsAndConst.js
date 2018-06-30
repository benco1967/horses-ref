module.exports =  {
  LINK : /<\/.*?>;\s*rel=".*?";\s*method="(POST|GET|PUT|DELETE)"(;\s*title=".*?")?(;\s*name=".*?";)?(\s*type="application\/json")?/,
  STATUS: /^(ok|warning|error|unknow|undefined)$/,
  AUTHORIZATION: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0ZXN0IiwiaWF0IjoxNTE1Njg1NDExLCJleHAiOjE4OTQzNzc1NDAsImF1ZCI6Im5vdGlmIGFuZCBvdGhlciIsInN1YiI6InRlc3RAZXhhbXBsZS5jb20iLCJFbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlcyI6Ik1hbmFnZXIifQ.65Yy3RGvZJf3_le2v8ZR_mZbCvS4irJnWV2tdBZhmPc',
  isLocaleText: t => t.should
    .be.instanceof(Array)
    .and
    .matchEach({
      locale: l => l.should.be.a.String,
      text: t => t.should.be.a.String
    })
};