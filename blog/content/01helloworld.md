Title: My first server-less side project
Date: 2016-11-27
Slug: hello-world

I present to you my first server-less side project [reviewtheinterview.com](https://reviewtheinterview.com).
This took about 3 weekends to make and was mostly an excuse build something from the ground up and learn some new stuff along the way.

Here are some high level details on the tech stack:

* **Backend**:
    * AWS (Route53, Lamda, S3, API Gateway, CloudFront, DynamoDB, CloudWatch)  - Everything for this site is hosted in a single AWS account and well within the free tier, especially since there are no EC2 instances.
    * [Kappa](https://github.com/garnaat/kappa) - Helpful for managing collections of lambda functions, Cloudformation is getting better but still not ready yet imo.
* **Frontend**:
    * The front-end is nothing special, no big framework, just straight javascript with the underscore library sass/bourbon/neat for the grid layout and typography.
    * [EmojiOne](http://emojione.com/) for the artwork.
    * [Awesomplete](https://leaverou.github.io/awesomplete/) for auto-complete though it's not very useful as it is now.
    * [Animate.css](https://daneden.github.io/animate.css/) for the animations that I went over-board on.
