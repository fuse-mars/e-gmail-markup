# Enhanced Gmail Markup

```json-ld
{
  "@context": "http://schema.org",
  "@type": "EmailMessage",
  "thumbnailUrl": "http://example.com/assets/image.png",
  "headline": "Response from mark@example.com",
  "text": "Mark from Google responded to your email in Inbox (jon@comapny.com)",
  "discussionUrl": "https://mail.google.com/mail/u/1/#inbox/xyz789",
  "potentialAction": [{
    "@type": "SaveAction",
    "name": "Ignore Person",
    "handler": {
      "@type": "HttpActionHandler",
      "url": "https://example.com/ignore/person?messageId=xyz789",
      "method": "HttpRequestMethod.GET"
    }
  },{
    "@type": "SaveAction",
    "name": "Ignore Message",
    "handler": {
      "@type": "HttpActionHandler",
      "url": "https://example.com/ignore/message/?messageId=xyz789",
      "method": "HttpRequestMethod.GET"
    }
  }],
  "description": "$5 meal at Joe's Diner"
}
```
