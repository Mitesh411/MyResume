# My Resume

This is a simple resume website built using HTML, CSS and JavaScript. It contains the following sections:

## Home
The home page contains a brief introduction and links to different sections of the resume.

## About
The about page has details about education, skills, experience etc.

## Projects 
The projects page lists some sample projects with images and descriptions.

## Contact
The contact page has a contact form and social media links to get in touch.

The website is fully responsive and optimized for mobile devices. The styling is done using CSS Flexbox and Grid layouts.

The source code is available on [GitHub](https://github.com/mitesh411/MyResume). Feel free to use it as a template for your own resume website.

Here are the steps to build a Dockerfile for the resume website described in the README.md file:

Create a Dockerfile
FROM nginx:alpine

# Exclude unnecessary files
COPY .dockerignore ./
COPY . /usr/share/nginx/html

This starts from the nginx Alpine image as the base.

Copy the website files into the container
COPY . /usr/share/nginx/html

This copies the local context (current directory) to the default nginx document root.

Expose port 80
EXPOSE 80

This exposes port 80 for the web server.

Set the default command to nginx
CMD ["nginx", "-g", "daemon off;"]

This overrides the default CMD and starts nginx.

Build the Docker image
docker build -t my-resume .

This builds the image using the Dockerfile in the current directory and tags it as my-resume.

Run a container from the image
docker run -p 80:80 my-resume

This starts a container on port 80 from the my-resume image.

So in summary, the Dockerfile copies the website files, exposes port 80, starts nginx and can be built and run as a container for the resume site.