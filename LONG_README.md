# Enhanced Gmail Markup

# Gmail Actions

**Google** allows you to place a [custom button](https://developers.google.com/gmail/markup/reference/one-click-action) in front of your email message summary in *Gmail*.

![One Click Actions](https://developers.google.com/gmail/markup/images/actions-one-click-action.png)

# Problem

However, it does not allow you to place the same custom button inside the body of the email message in *Gmail*

![One Click Actions](https://developers.google.com/gmail/markup/images/actions-one-click-action.png)

# Scenario

We have this html content below that we want to send to a user. then we want them to click on either one of the two buttons defined in our **application/ld+json** script
```html
<html lang="en">
    <body>
        <script type="application/ld+json">
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
                }]
            }
        </script>
        <p>
            Dear John, Mark from Google responded to your email in Inbox (john@comapny.com)
        </p>
        <p>
            MESSAGE DETAILS<br/>
            Hi John<br/>
            Your product looks great<br/>
            but it more expensive than what we use now<br/>
            and we do not plan to switch.<br/>
            Sincerely
        </p>
    </body>
</html>
```

* Content of interest
```json
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
  }]
}
```



