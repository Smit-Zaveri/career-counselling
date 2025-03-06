const technologies = [
  {
    id: "frontend",
    name: "Frontend",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Front-end_development.svg/512px-Front-end_development.svg.png",
    itemsCount: 10,
    roadmapItems: [
      {
        id: "html-basics",
        title: "HTML Basics",
        subtitle: "Markup language for web pages",
        color: "#E34C26",
        description:
          "HTML is the standard markup language used to create the structure of web pages. Learn its syntax, elements, and best practices for building semantic and accessible content.",
        concepts: [
          "HTML syntax and document structure",
          "Elements and tags",
          "Attributes and nesting",
          "Semantic HTML",
          "Forms and input types",
        ],
        resources: [
          {
            title: "MDN HTML Introduction",
            url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
          },
          {
            title: "W3Schools HTML Tutorial",
            url: "https://www.w3schools.com/html/",
          },
        ],
      },
      {
        id: "css-basics",
        title: "CSS Basics",
        subtitle: "Styling web pages",
        color: "#264DE4",
        description:
          "CSS is used to control the presentation of web pages. Understand selectors, properties, the box model, and how to create responsive layouts.",
        concepts: [
          "CSS syntax and selectors",
          "Box model",
          "Flexbox and Grid layouts",
          "Responsive design and media queries",
          "Animations and transitions",
        ],
        resources: [
          {
            title: "MDN CSS Basics",
            url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/What_is_CSS",
          },
          {
            title: "CSS-Tricks",
            url: "https://css-tricks.com/",
          },
        ],
      },
      {
        id: "javascript-essentials",
        title: "JavaScript Essentials",
        subtitle: "Programming for interactivity",
        color: "#F7DF1E",
        description:
          "JavaScript brings interactivity and dynamic behavior to web pages. Learn its core concepts, DOM manipulation, event handling, and modern ES6+ features.",
        concepts: [
          "JavaScript syntax and data types",
          "DOM manipulation and event handling",
          "ES6+ features (let/const, arrow functions, modules)",
          "Asynchronous programming (callbacks, promises, async/await)",
          "Error handling and debugging",
        ],
        resources: [
          {
            title: "MDN JavaScript Guide",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
          },
          {
            title: "JavaScript.info",
            url: "https://javascript.info/",
          },
        ],
      },
      {
        id: "frontend-frameworks",
        title: "Frontend Frameworks",
        subtitle: "Modern UI libraries and frameworks",
        color: "#61DAFB",
        description:
          "Explore popular frontend frameworks like React, Angular, and Vue to build dynamic single-page applications with component-based architectures.",
        concepts: [
          "Overview of React, Angular, and Vue",
          "Component-based architecture",
          "State management and data flow",
          "Routing for SPAs",
          "Comparing framework ecosystems",
        ],
        resources: [
          {
            title: "React Official Documentation",
            url: "https://react.dev/learn",
          },
          {
            title: "Angular Docs",
            url: "https://angular.io/docs",
          },
          {
            title: "Vue.js Guide",
            url: "https://vuejs.org/v2/guide/",
          },
        ],
      },
      {
        id: "build-tools",
        title: "Build Tools and Package Managers",
        subtitle: "Streamlining development",
        color: "#F39C12",
        description:
          "Modern development relies on build tools and package managers to optimize workflow. Learn about bundlers, task runners, and module transpilation.",
        concepts: [
          "Package managers (npm, yarn)",
          "Module bundlers (Webpack, Parcel)",
          "Task runners (Gulp, Grunt)",
          "Transpiling with Babel",
          "Code splitting and minification",
        ],
        resources: [
          {
            title: "Webpack Concepts",
            url: "https://webpack.js.org/concepts/",
          },
          {
            title: "Parcel Bundler",
            url: "https://parceljs.org/",
          },
        ],
      },
      {
        id: "responsive-design",
        title: "Responsive and Adaptive Design",
        subtitle: "Building mobile-friendly sites",
        color: "#2ECC71",
        description:
          "Ensure your web applications look great on all devices. Master responsive design techniques, fluid layouts, and mobile-first strategies.",
        concepts: [
          "Media queries and breakpoints",
          "Mobile-first design principles",
          "Fluid grids and flexible images",
          "CSS frameworks (Bootstrap, Tailwind CSS)",
          "Cross-browser compatibility",
        ],
        resources: [
          {
            title: "MDN Responsive Design",
            url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design",
          },
          {
            title: "Bootstrap Documentation",
            url: "https://getbootstrap.com/docs/5.0/getting-started/introduction/",
          },
        ],
      },
      {
        id: "accessibility",
        title: "Web Accessibility (a11y)",
        subtitle: "Inclusive web design",
        color: "#E74C3C",
        description:
          "Create web experiences that are accessible to everyone by following accessibility standards and best practices.",
        concepts: [
          "ARIA roles and attributes",
          "Semantic HTML",
          "Keyboard navigation",
          "Color contrast and readability",
          "Accessibility testing tools",
        ],
        resources: [
          {
            title: "WebAIM: Accessibility Basics",
            url: "https://webaim.org/intro/",
          },
          {
            title: "W3C WCAG Guidelines",
            url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
          },
        ],
      },
      {
        id: "frontend-testing",
        title: "Testing and Debugging",
        subtitle: "Ensuring quality and reliability",
        color: "#9B59B6",
        description:
          "Implement testing strategies to catch bugs early and maintain code quality. Learn unit, integration, and end-to-end testing approaches.",
        concepts: [
          "Unit testing with Jest",
          "Component testing with frameworks like React Testing Library",
          "End-to-end testing with Cypress or Selenium",
          "Browser developer tools",
          "Debugging techniques",
        ],
        resources: [
          {
            title: "Jest Documentation",
            url: "https://jestjs.io/docs/getting-started",
          },
          {
            title: "Cypress Documentation",
            url: "https://docs.cypress.io/guides/overview/why-cypress",
          },
        ],
      },
      {
        id: "performance-optimization",
        title: "Performance Optimization",
        subtitle: "Optimizing web performance",
        color: "#3498DB",
        description:
          "Improve load times and user experience by optimizing assets, reducing render-blocking resources, and utilizing performance best practices.",
        concepts: [
          "Minification and compression",
          "Lazy loading images and assets",
          "Optimizing critical rendering path",
          "Web performance testing tools",
          "Progressive Web App (PWA) basics",
        ],
        resources: [
          {
            title: "Google Web Fundamentals",
            url: "https://developers.google.com/web/fundamentals/performance",
          },
          {
            title: "Lighthouse Performance",
            url: "https://developers.google.com/web/tools/lighthouse",
          },
        ],
      },
      {
        id: "frontend-deployment",
        title: "Deployment and CI/CD",
        subtitle: "From development to production",
        color: "#34495E",
        description:
          "Learn how to deploy your frontend applications efficiently using static site hosts, CDNs, and CI/CD pipelines to ensure smooth, automated releases.",
        concepts: [
          "Static site hosting (Netlify, Vercel)",
          "CI/CD for frontend projects",
          "Build automation",
          "Version control integration",
          "Environment configuration",
        ],
        resources: [
          {
            title: "Netlify Documentation",
            url: "https://docs.netlify.com/",
          },
          {
            title: "Vercel Docs",
            url: "https://vercel.com/docs",
          },
        ],
      },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Server_icon.svg/512px-Server_icon.svg.png",
    itemsCount: 10,
    roadmapItems: [
      {
        id: "backend-intro",
        title: "Backend Fundamentals",
        subtitle: "Introduction to Server-side Development",
        color: "#2E86C1",
        description:
          "Backend development involves creating the server-side logic that powers web applications. It handles business logic, data management, and integration with other systems, ensuring that frontend applications get the data and functionality they need.",
        concepts: [
          "Understanding the client-server model",
          "Roles of backend vs frontend",
          "Server architecture basics",
          "Introduction to APIs and web services",
          "Deployment and hosting fundamentals",
        ],
        resources: [
          {
            title: "Backend Development Overview - freeCodeCamp",
            url: "https://www.freecodecamp.org/news/what-is-backend-development/",
          },
          {
            title: "Introduction to Backend Development - Codecademy",
            url: "https://www.codecademy.com/learn/learn-back-end",
          },
        ],
      },
      {
        id: "backend-languages",
        title: "Backend Programming Languages",
        subtitle: "Choosing the right language",
        color: "#8E44AD",
        description:
          "Backend systems can be built using various programming languages. Explore languages such as JavaScript (Node.js), Python, Ruby, Java, Go, and PHP to understand their strengths and ecosystem support.",
        concepts: [
          "JavaScript with Node.js",
          "Python (Django, Flask)",
          "Ruby on Rails",
          "Java (Spring Boot)",
          "PHP (Laravel)",
          "Go and other emerging languages",
        ],
        resources: [
          {
            title: "Comparing Backend Programming Languages",
            url: "https://www.geeksforgeeks.org/top-6-backend-programming-languages/",
          },
        ],
      },
      {
        id: "backend-webservers",
        title: "Web Servers and Protocols",
        subtitle: "HTTP, HTTPS, and server architecture",
        color: "#27AE60",
        description:
          "Learn how web servers operate and communicate over the internet. Understand protocols like HTTP/HTTPS, the role of web servers (Apache, Nginx), and the basics of load balancing.",
        concepts: [
          "HTTP/HTTPS fundamentals",
          "Web server software (Apache, Nginx)",
          "Load balancing techniques",
          "Understanding REST vs SOAP",
          "SSL/TLS and secure communications",
        ],
        resources: [
          {
            title: "MDN HTTP Overview",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
          },
        ],
      },
      {
        id: "backend-api",
        title: "API Design and Development",
        subtitle: "Building robust interfaces",
        color: "#E67E22",
        description:
          "APIs are the bridge between the frontend and backend. Learn how to design, build, document, and secure APIs using RESTful principles, GraphQL, or RPC protocols.",
        concepts: [
          "RESTful API design",
          "GraphQL basics",
          "API versioning and documentation",
          "Authentication and rate limiting",
          "Using tools like Swagger/OpenAPI",
        ],
        resources: [
          {
            title: "REST API Tutorial",
            url: "https://restfulapi.net/",
          },
          {
            title: "GraphQL Official Documentation",
            url: "https://graphql.org/learn/",
          },
        ],
      },
      {
        id: "backend-databases",
        title: "Databases and Data Storage",
        subtitle: "SQL and NoSQL solutions",
        color: "#2980B9",
        description:
          "Choose the right data storage solution for your application. Understand the differences between relational (SQL) and non-relational (NoSQL) databases, data modeling, and best practices in data management.",
        concepts: [
          "Relational databases (MySQL, PostgreSQL)",
          "NoSQL databases (MongoDB, Redis, Cassandra)",
          "Data modeling and schema design",
          "ORMs and query builders",
          "ACID vs BASE properties",
        ],
        resources: [
          {
            title: "MongoDB Official Documentation",
            url: "https://docs.mongodb.com/",
          },
          {
            title: "PostgreSQL Tutorial",
            url: "https://www.postgresql.org/docs/",
          },
        ],
      },
      {
        id: "backend-security",
        title: "Authentication and Security",
        subtitle: "Securing backend systems",
        color: "#C0392B",
        description:
          "Implement robust security measures to protect backend systems. Learn about authentication, authorization, data encryption, and best practices to mitigate vulnerabilities.",
        concepts: [
          "JWT, OAuth, and OpenID Connect",
          "Encryption and data security",
          "Secure API design",
          "CORS and CSRF protection",
          "OWASP best practices",
        ],
        resources: [
          {
            title: "JWT Introduction",
            url: "https://jwt.io/introduction",
          },
          {
            title: "OWASP Security Guidelines",
            url: "https://owasp.org/",
          },
        ],
      },
      {
        id: "backend-architecture",
        title: "Microservices and Serverless",
        subtitle: "Modern backend architectures",
        color: "#6C5B7B",
        description:
          "Modern backend development often involves breaking applications into smaller, manageable services. Explore microservices architecture and serverless computing to build scalable and flexible systems.",
        concepts: [
          "Microservices design principles",
          "Serverless architecture (AWS Lambda, Azure Functions)",
          "Containers and orchestration (Docker, Kubernetes)",
          "Service mesh and API gateways",
          "Event-driven architectures",
        ],
        resources: [
          {
            title: "Microservices.io",
            url: "https://microservices.io/",
          },
          {
            title: "AWS Lambda Documentation",
            url: "https://aws.amazon.com/lambda/",
          },
        ],
      },
      {
        id: "backend-performance",
        title: "Scalability and Performance Optimization",
        subtitle: "Optimizing backend systems",
        color: "#16A085",
        description:
          "Ensure your backend systems can handle high traffic and complex operations. Learn caching strategies, load balancing, query optimization, and performance monitoring techniques.",
        concepts: [
          "Caching (Redis, Memcached)",
          "Load balancing and horizontal scaling",
          "Query optimization",
          "Asynchronous processing and queuing",
          "Performance monitoring and profiling",
        ],
        resources: [
          {
            title: "Redis Documentation",
            url: "https://redis.io/documentation",
          },
        ],
      },
      {
        id: "backend-testing",
        title: "Testing and Monitoring",
        subtitle: "Ensuring reliability",
        color: "#9B59B6",
        description:
          "Implement automated testing and robust monitoring for your backend applications. This includes unit testing, integration testing, logging, and performance tracking to quickly identify and resolve issues.",
        concepts: [
          "Unit and integration testing",
          "API testing (Postman, Insomnia)",
          "Logging and error tracking",
          "Monitoring tools (New Relic, Prometheus)",
          "Continuous testing in CI/CD pipelines",
        ],
        resources: [
          {
            title: "Jest Testing Framework",
            url: "https://jestjs.io/",
          },
          {
            title: "Prometheus Monitoring",
            url: "https://prometheus.io/docs/",
          },
        ],
      },
      {
        id: "backend-deployment",
        title: "Deployment and CI/CD",
        subtitle: "Delivering backend applications",
        color: "#34495E",
        description:
          "Learn how to deploy and maintain backend applications with CI/CD pipelines, containerization, and cloud platforms. This ensures seamless updates and reliable performance in production environments.",
        concepts: [
          "CI/CD pipelines and automation",
          "Containerization with Docker",
          "Orchestration with Kubernetes",
          "Cloud platforms (AWS, Azure, GCP)",
          "Deployment strategies and rollback plans",
        ],
        resources: [
          {
            title: "Docker Documentation",
            url: "https://docs.docker.com/",
          },
          {
            title: "Kubernetes Official Docs",
            url: "https://kubernetes.io/docs/",
          },
        ],
      },
    ],
  },
  {
    id: "fullstack",
    name: "Full Stack",
    iconUrl: "https://via.placeholder.com/512?text=Full+Stack",
    itemsCount: 10,
    roadmapItems: [
      {
        id: "fs-intro",
        title: "Full Stack Overview",
        subtitle: "Understanding full stack development",
        color: "#1ABC9C",
        description:
          "Full stack development involves working on both the frontend and backend of applications. This section provides an overview of the roles, responsibilities, and key technologies that make up a full stack developer's toolkit.",
        concepts: [
          "Definition of Full Stack Development",
          "Frontend vs Backend vs DevOps",
          "Project structure and architecture",
          "Industry trends and roles",
          "End-to-end application flow",
        ],
        resources: [
          {
            title: "What is Full Stack Development?",
            url: "https://www.freecodecamp.org/news/what-is-full-stack-development/",
          },
        ],
      },
      {
        id: "fs-frontend",
        title: "Frontend Development",
        subtitle: "Building interactive user interfaces",
        color: "#3498DB",
        description:
          "Master the client-side of applications by learning HTML, CSS, JavaScript, and modern frameworks. Understand responsive design, accessibility, and performance optimization for a seamless user experience.",
        concepts: [
          "HTML, CSS, and JavaScript fundamentals",
          "Responsive design and accessibility",
          "Modern frameworks (React, Angular, Vue)",
          "State management and client-side routing",
          "Frontend build tools and bundlers",
        ],
        resources: [
          {
            title: "MDN Web Docs - Frontend",
            url: "https://developer.mozilla.org/en-US/docs/Learn/Front-end_web_developer",
          },
        ],
      },
      {
        id: "fs-backend",
        title: "Backend Development",
        subtitle: "Building robust server-side applications",
        color: "#E67E22",
        description:
          "Learn to create server-side logic, build RESTful APIs or GraphQL endpoints, and implement business logic using popular backend frameworks and programming languages.",
        concepts: [
          "Server, client, and database interactions",
          "RESTful API design and GraphQL",
          "Backend frameworks (Express, Django, Spring Boot)",
          "Authentication, security, and error handling",
          "Microservices and serverless architectures",
        ],
        resources: [
          {
            title: "Backend Development Overview",
            url: "https://www.codecademy.com/articles/what-is-back-end-development",
          },
        ],
      },
      {
        id: "fs-databases",
        title: "Database Management",
        subtitle: "Efficient data storage and retrieval",
        color: "#27AE60",
        description:
          "Master data management by understanding both relational and non-relational databases. Learn data modeling, schema design, query optimization, and integration with backend services.",
        concepts: [
          "Relational databases (MySQL, PostgreSQL)",
          "NoSQL databases (MongoDB, Redis)",
          "Data modeling and schema design",
          "Query optimization and indexing",
          "ORMs and query builders",
        ],
        resources: [
          {
            title: "SQL vs NoSQL",
            url: "https://www.mongodb.com/scale/sql-vs-nosql",
          },
        ],
      },
      {
        id: "fs-version-control",
        title: "Version Control & Collaboration",
        subtitle: "Managing and collaborating on code",
        color: "#F39C12",
        description:
          "Learn Git and other version control systems to effectively manage code, collaborate with teams, and maintain a robust development workflow using branching, merging, and pull requests.",
        concepts: [
          "Git basics and advanced commands",
          "Branching and merging strategies",
          "Git workflows (GitFlow, GitHub Flow)",
          "Code reviews and pull requests",
          "Collaboration on platforms like GitHub or GitLab",
        ],
        resources: [
          {
            title: "Git Official Documentation",
            url: "https://git-scm.com/doc",
          },
        ],
      },
      {
        id: "fs-devops",
        title: "Deployment and DevOps",
        subtitle: "Bridging development and operations",
        color: "#8E44AD",
        description:
          "Gain skills in deploying applications using CI/CD pipelines, containerization, cloud platforms, and monitoring tools. Understand how to automate builds, tests, and deployments for continuous delivery.",
        concepts: [
          "CI/CD pipelines and automation",
          "Containerization with Docker and Kubernetes",
          "Cloud platforms (AWS, Azure, GCP)",
          "Monitoring, logging, and performance tracking",
          "Infrastructure as Code (Terraform, CloudFormation)",
        ],
        resources: [
          {
            title: "DevOps Handbook",
            url: "https://www.amazon.com/DevOps-Handbook-World-Class-Reliability-Organizations/dp/1942788002",
          },
        ],
      },
      {
        id: "fs-security",
        title: "Security Best Practices",
        subtitle: "Protecting full stack applications",
        color: "#C0392B",
        description:
          "Implement robust security measures across both frontend and backend components. Learn about authentication, data encryption, secure API design, and common vulnerabilities to safeguard your applications.",
        concepts: [
          "Authentication and authorization mechanisms",
          "Data encryption and secure communication",
          "OWASP Top 10 vulnerabilities",
          "Secure API design and implementation",
          "Regular security audits and testing",
        ],
        resources: [
          {
            title: "OWASP Top Ten",
            url: "https://owasp.org/www-project-top-ten/",
          },
        ],
      },
      {
        id: "fs-testing",
        title: "Testing and Quality Assurance",
        subtitle: "Ensuring reliability and performance",
        color: "#9B59B6",
        description:
          "Learn and implement testing strategies for both frontend and backend code, including unit, integration, and end-to-end tests. Incorporate automated testing into your CI/CD pipelines to maintain code quality.",
        concepts: [
          "Unit testing frameworks (Jest, Mocha)",
          "Integration and end-to-end testing (Cypress, Selenium)",
          "Test-driven development (TDD)",
          "Performance and load testing",
          "Continuous testing in CI/CD",
        ],
        resources: [
          {
            title: "Jest Documentation",
            url: "https://jestjs.io/",
          },
        ],
      },
      {
        id: "fs-performance",
        title: "Performance Optimization",
        subtitle: "Building efficient applications",
        color: "#2980B9",
        description:
          "Optimize both frontend and backend performance by employing best practices in code, caching strategies, efficient database queries, and load balancing to ensure a fast, scalable application.",
        concepts: [
          "Frontend performance (lazy loading, code splitting)",
          "Backend optimization (caching, load balancing)",
          "Database indexing and query tuning",
          "Monitoring and profiling tools",
          "Scalable architecture best practices",
        ],
        resources: [
          {
            title: "Google Web Fundamentals - Performance",
            url: "https://developers.google.com/web/fundamentals/performance",
          },
        ],
      },
      {
        id: "fs-soft-skills",
        title: "Soft Skills and Career Development",
        subtitle: "Professional growth and collaboration",
        color: "#34495E",
        description:
          "Develop essential soft skills like communication, problem-solving, and teamwork. Enhance your career prospects by building a strong portfolio, engaging in community learning, and understanding agile methodologies.",
        concepts: [
          "Effective communication and collaboration",
          "Agile methodologies and project management",
          "Building a portfolio and resume",
          "Networking and community involvement",
          "Continuous learning and personal growth",
        ],
        resources: [
          {
            title: "Building a Tech Portfolio",
            url: "https://www.freecodecamp.org/news/how-to-build-your-portfolio-as-a-developer/",
          },
        ],
      },
    ],
  },
  {
    id: "react",
    name: "React",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png",
    itemsCount: 12,
    roadmapItems: [
      {
        id: "react-basics",
        title: "React Basics",
        subtitle: "Core concepts and JSX",
        color: "#61DAFB",
        description:
          "React is a JavaScript library for building user interfaces. It helps you build reusable components, manage application state, and handle complex user interactions with ease.",
        concepts: [
          "JSX syntax and why it's needed",
          "React.createElement and virtual DOM",
          "Components (Functional vs Class Components)",
          "Props and PropTypes",
          "State management within components",
          "Component lifecycle methods (Class components)",
          "Event handling and synthetic events",
        ],
        resources: [
          {
            title: "React Official Documentation - Basics",
            url: "https://react.dev/learn",
          },
          {
            title: "React JSX Explained",
            url: "https://reactjs.org/docs/introducing-jsx.html",
          },
          {
            title: "React Components and Props",
            url: "https://reactjs.org/docs/components-and-props.html",
          },
        ],
      },
      {
        id: "react-hooks",
        title: "React Hooks",
        subtitle: "Functional component state and effects",
        color: "#61DAFB",
        description:
          "Hooks allow you to use state and other React features without writing a class. They make components simpler and more reusable.",
        concepts: [
          "useState for managing local state",
          "useEffect for side effects and lifecycle simulation",
          "useContext for global state management",
          "useRef for accessing DOM elements and persisting values",
          "Creating custom hooks for reusable logic",
        ],
        resources: [
          {
            title: "Hooks API Reference",
            url: "https://reactjs.org/docs/hooks-reference.html",
          },
          {
            title: "React Hooks Cheatsheet",
            url: "https://react-hooks-cheatsheet.com/",
          },
          {
            title: "Thinking in React Hooks",
            url: "https://wattenberger.com/blog/react-hooks",
          },
        ],
      },
      {
        id: "react-router",
        title: "React Router",
        subtitle: "Routing and navigation",
        color: "#CA4245",
        description:
          "React Router helps you add navigation to your React applications. It supports declarative routes and nested routing structures.",
        concepts: [
          "BrowserRouter and HashRouter",
          "Route and Switch (or Routes in v6+)",
          "Link and NavLink for navigation",
          "Dynamic routing with URL params",
          "Nested and relative routes",
        ],
        resources: [
          {
            title: "React Router Official Docs",
            url: "https://reactrouter.com/en/main",
          },
          {
            title: "React Router v6 Tutorial",
            url: "https://reactrouter.com/en/main/start/tutorial",
          },
        ],
      },
      {
        id: "state-management",
        title: "State Management",
        subtitle: "Managing state across your app",
        color: "#FF6347",
        description:
          "Learn how to manage state effectively in large applications using context, reducers, or external state management libraries.",
        concepts: [
          "Global state vs local state",
          "Context API and useContext",
          "Reducer pattern with useReducer",
          "Third-party libraries (Redux, Zustand, Jotai)",
          "State normalization and immutability",
        ],
        resources: [
          {
            title: "State Management in React (Official)",
            url: "https://react.dev/learn/passing-data-deeply-with-context",
          },
          {
            title: "Redux Official Documentation",
            url: "https://redux.js.org/",
          },
        ],
      },
      {
        id: "forms-handling",
        title: "Forms Handling",
        subtitle: "Handling user input and forms",
        color: "#FF8C00",
        description:
          "React makes form handling easy through controlled and uncontrolled components.",
        concepts: [
          "Controlled components",
          "Uncontrolled components",
          "Handling form submissions",
          "Form validation strategies",
          "Form libraries (Formik, React Hook Form)",
        ],
        resources: [
          {
            title: "React Forms Guide",
            url: "https://reactjs.org/docs/forms.html",
          },
          {
            title: "Formik Documentation",
            url: "https://formik.org/",
          },
          {
            title: "React Hook Form Documentation",
            url: "https://react-hook-form.com/",
          },
        ],
      },
      {
        id: "react-performance",
        title: "Performance Optimization",
        subtitle: "Making React apps faster",
        color: "#32CD32",
        description:
          "Learn techniques to improve the performance of your React application.",
        concepts: [
          "React.memo for component memoization",
          "useCallback and useMemo",
          "Lazy loading with React.lazy()",
          "Code splitting",
          "Performance profiling with React DevTools",
        ],
        resources: [
          {
            title: "Performance Optimization Tips",
            url: "https://react.dev/learn/optimizing-performance",
          },
        ],
      },
      {
        id: "error-handling",
        title: "Error Handling",
        subtitle: "Catching and managing errors gracefully",
        color: "#DC143C",
        description: "Learn how to handle errors in React applications.",
        concepts: [
          "Error boundaries",
          "Try/catch in event handlers",
          "Error reporting and logging",
          "Error recovery UI",
        ],
        resources: [
          {
            title: "Error Boundaries in React",
            url: "https://reactjs.org/docs/error-boundaries.html",
          },
        ],
      },
      {
        id: "testing",
        title: "Testing in React",
        subtitle: "Ensuring code quality",
        color: "#6A5ACD",
        description: "Learn how to test React components and applications.",
        concepts: [
          "Unit testing with Jest",
          "Component testing with React Testing Library",
          "Mocking API calls",
          "End-to-end testing with Cypress",
          "Snapshot testing",
        ],
        resources: [
          {
            title: "Testing Library Documentation",
            url: "https://testing-library.com/docs/react-testing-library/intro/",
          },
        ],
      },
      {
        id: "advanced-patterns",
        title: "Advanced Patterns",
        subtitle: "Reusable patterns and techniques",
        color: "#FFD700",
        description:
          "Learn advanced React patterns for building scalable applications.",
        concepts: [
          "Higher-Order Components (HOCs)",
          "Render props pattern",
          "Compound components",
          "Controlled vs uncontrolled components",
        ],
        resources: [
          {
            title: "React Patterns",
            url: "https://reactpatterns.com/",
          },
        ],
      },
    ],
  },
  {
    id: "react-native",
    name: "React Native",
    iconUrl:
      "https://d33wubrfki0l68.cloudfront.net/554c3b0e09cf167f0281fda839a5433f2040b349/ecfc9/img/header_logo.svg",
    itemsCount: 12,
    roadmapItems: [
      {
        id: "rn-introduction",
        title: "Introduction to React Native",
        subtitle: "What is React Native?",
        color: "#61DAFB",
        description:
          "React Native lets you build mobile apps using JavaScript and React. Learn how it works, its advantages, and how it compares to other mobile frameworks.",
        concepts: [
          "What is React Native?",
          "React Native vs Native Development",
          "React Native vs Flutter",
          "Core Architecture Overview",
          "Hello World App",
        ],
        resources: [
          {
            title: "Official React Native Docs",
            url: "https://reactnative.dev/docs/getting-started",
          },
          {
            title: "React Native Overview",
            url: "https://www.freecodecamp.org/news/what-is-react-native/",
          },
        ],
      },
      {
        id: "rn-setup",
        title: "Environment Setup",
        subtitle: "Setting up development environment",
        color: "#4CAF50",
        description:
          "Learn how to set up your development environment for building React Native apps, including installing Node.js, Expo CLI, and Android/iOS simulators.",
        concepts: [
          "Node.js and npm/yarn",
          "Installing Expo CLI",
          "Android Studio Setup",
          "Xcode Setup for iOS (macOS)",
          "Running app on emulator/device",
        ],
        resources: [
          {
            title: "React Native Environment Setup",
            url: "https://reactnative.dev/docs/environment-setup",
          },
          {
            title: "Expo Documentation",
            url: "https://docs.expo.dev/",
          },
        ],
      },
      {
        id: "rn-basics",
        title: "Core Components and Styling",
        subtitle: "UI building blocks",
        color: "#61DAFB",
        description:
          "Learn the core building blocks and how to style your app using Flexbox, StyleSheet API, and inline styles.",
        concepts: [
          "View, Text, Image",
          "StyleSheet API",
          "Flexbox Layout",
          "TextInput, Button",
          "TouchableOpacity, ScrollView",
        ],
        resources: [
          {
            title: "Core Components Docs",
            url: "https://reactnative.dev/docs/components-and-apis",
          },
          {
            title: "React Native Styling",
            url: "https://reactnative.dev/docs/style",
          },
        ],
      },
      {
        id: "rn-navigation",
        title: "Navigation in React Native",
        subtitle: "Navigating between screens",
        color: "#5F6CD7",
        description:
          "Understand how to implement navigation using React Navigation, including stack, tab, and drawer navigators.",
        concepts: [
          "Stack Navigation",
          "Tab Navigation",
          "Drawer Navigation",
          "Navigation params",
          "Nested Navigators",
        ],
        resources: [
          {
            title: "React Navigation Docs",
            url: "https://reactnavigation.org/docs/getting-started",
          },
          {
            title: "Navigation Patterns",
            url: "https://reactnavigation.org/docs/navigation-lifecycle",
          },
        ],
      },
      {
        id: "rn-state-management",
        title: "State Management",
        subtitle: "Managing global state",
        color: "#FF9800",
        description:
          "Explore different state management techniques for React Native apps, including Context API, Redux, and Zustand.",
        concepts: [
          "Local State (useState)",
          "Context API",
          "Redux Toolkit",
          "Zustand",
          "Async Storage for Persistence",
        ],
        resources: [
          {
            title: "State Management Guide",
            url: "https://reactnative.dev/docs/state-management",
          },
          {
            title: "Redux in React Native",
            url: "https://redux.js.org/introduction/getting-started",
          },
        ],
      },
      {
        id: "rn-networking",
        title: "Networking and API Calls",
        subtitle: "Fetching data from servers",
        color: "#03A9F4",
        description:
          "Learn how to fetch and display data in your app using Fetch API and Axios, and handle network errors gracefully.",
        concepts: [
          "Fetch API",
          "Axios for HTTP Requests",
          "Handling Errors",
          "Loading States",
          "Displaying Data",
        ],
        resources: [
          {
            title: "Networking in React Native",
            url: "https://reactnative.dev/docs/network",
          },
          {
            title: "Using Axios in React Native",
            url: "https://www.npmjs.com/package/axios",
          },
        ],
      },
      {
        id: "rn-device-features",
        title: "Using Device Features",
        subtitle: "Accessing native capabilities",
        color: "#8E44AD",
        description:
          "Learn how to access device capabilities like camera, location, and sensors using Expo modules and React Native libraries.",
        concepts: [
          "Camera Access",
          "Location Services",
          "Push Notifications",
          "Permissions Handling",
          "Device Sensors (Accelerometer)",
        ],
        resources: [
          {
            title: "Expo Modules",
            url: "https://docs.expo.dev/versions/latest/",
          },
          {
            title: "React Native Permissions",
            url: "https://github.com/zoontek/react-native-permissions",
          },
        ],
      },
      {
        id: "rn-performance",
        title: "Performance Optimization",
        subtitle: "Improve performance",
        color: "#E91E63",
        description:
          "Explore strategies to improve performance of React Native apps, including avoiding unnecessary re-renders and optimizing images.",
        concepts: [
          "FlatList Optimization",
          "Avoiding Re-renders",
          "Memoization with React.memo",
          "Lazy Loading Images",
          "Profiling and Debugging",
        ],
        resources: [
          {
            title: "Performance Optimization Guide",
            url: "https://reactnative.dev/docs/performance",
          },
          {
            title: "Profiling React Native Apps",
            url: "https://facebook.github.io/react-native/docs/profiling",
          },
        ],
      },
      {
        id: "rn-testing",
        title: "Testing in React Native",
        subtitle: "Ensuring app reliability",
        color: "#9C27B0",
        description:
          "Understand how to write tests for React Native apps using Jest, React Native Testing Library, and Detox.",
        concepts: [
          "Unit Testing",
          "Component Testing",
          "Snapshot Testing",
          "End-to-End Testing",
          "Mocking APIs",
        ],
        resources: [
          {
            title: "Testing React Native Apps",
            url: "https://reactnative.dev/docs/testing-overview",
          },
          {
            title: "Detox for E2E Testing",
            url: "https://wix.github.io/Detox/docs/introduction/getting-started/",
          },
        ],
      },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
    itemsCount: 12,
    roadmapItems: [
      {
        id: "js-introduction",
        title: "Introduction to JavaScript",
        subtitle: "Learn the basics",
        color: "#F7DF1E",
        description:
          "Understand the origins of JavaScript, how it fits into web development, and its role in frontend and backend applications.",
        concepts: [
          "What is JavaScript?",
          "JavaScript vs ECMAScript",
          "History and Evolution",
          "Use Cases",
          "Hello World in JavaScript",
        ],
        resources: [
          {
            title: "MDN Introduction to JavaScript",
            url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript",
          },
          {
            title: "JavaScript Tutorial by freeCodeCamp",
            url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
          },
        ],
      },
      {
        id: "js-syntax",
        title: "Basic Syntax and Data Types",
        subtitle: "Core language features",
        color: "#E34C26",
        description:
          "Learn about JavaScript syntax, variables, data types, operators, and basic I/O.",
        concepts: [
          "Variables (var, let, const)",
          "Primitive Types (string, number, boolean)",
          "Complex Types (objects, arrays)",
          "Operators",
          "Comments",
        ],
        resources: [
          {
            title: "MDN Data Types and Structures",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures",
          },
        ],
      },
      {
        id: "js-functions",
        title: "Functions and Scope",
        subtitle: "Building blocks of JS",
        color: "#4CAF50",
        description:
          "Understand how to create and use functions, manage scope, and pass parameters.",
        concepts: [
          "Function Declaration & Expression",
          "Arrow Functions",
          "Parameters and Return Values",
          "Scope (Global, Local, Block)",
          "Closures",
        ],
        resources: [
          {
            title: "MDN Functions",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
          },
        ],
      },
      {
        id: "js-control-flow",
        title: "Control Flow",
        subtitle: "Logic and branching",
        color: "#FF5722",
        description:
          "Learn how to control the flow of a program using conditionals, loops, and error handling.",
        concepts: [
          "if/else Statements",
          "Switch Statement",
          "For, While, Do-While Loops",
          "Break and Continue",
          "Error Handling (try/catch)",
        ],
        resources: [
          {
            title: "MDN Control Flow",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
          },
        ],
      },
      {
        id: "js-objects-arrays",
        title: "Objects and Arrays",
        subtitle: "Data structures",
        color: "#2196F3",
        description:
          "Learn to work with JavaScript objects and arrays, their methods, and iteration techniques.",
        concepts: [
          "Object Literals",
          "Array Methods (map, filter, reduce)",
          "Object Methods",
          "Destructuring",
          "Spread and Rest Operators",
        ],
        resources: [
          {
            title: "MDN Objects",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
          },
          {
            title: "MDN Arrays",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
          },
        ],
      },
      {
        id: "js-dom",
        title: "DOM Manipulation",
        subtitle: "Interact with HTML",
        color: "#FFC107",
        description:
          "Learn how to use JavaScript to manipulate the Document Object Model (DOM) to create dynamic web pages.",
        concepts: [
          "Selecting Elements",
          "Modifying Elements",
          "Event Listeners",
          "Creating Elements",
          "Event Delegation",
        ],
        resources: [
          {
            title: "MDN DOM Introduction",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
          },
        ],
      },
      {
        id: "js-promises-async",
        title: "Asynchronous JavaScript",
        subtitle: "Working with async code",
        color: "#8E44AD",
        description:
          "Understand callbacks, promises, and async/await to manage asynchronous operations.",
        concepts: [
          "Callbacks",
          "Promises",
          "Async/Await",
          "Error Handling in Async Code",
          "Fetching Data (fetch API)",
        ],
        resources: [
          {
            title: "MDN Promises",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
          },
          {
            title: "MDN async/await",
            url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises",
          },
        ],
      },
      {
        id: "js-es6",
        title: "Modern JavaScript (ES6+)",
        subtitle: "New language features",
        color: "#3F51B5",
        description:
          "Explore new syntax and features introduced in ES6 and beyond.",
        concepts: [
          "Template Literals",
          "Destructuring",
          "Arrow Functions",
          "Modules (import/export)",
          "Optional Chaining",
        ],
        resources: [
          {
            title: "ES6 Features Overview",
            url: "https://www.w3schools.com/js/js_es6.asp",
          },
        ],
      },
      {
        id: "js-oop",
        title: "Object-Oriented Programming",
        subtitle: "OOP in JavaScript",
        color: "#607D8B",
        description:
          "Understand how to use objects, classes, inheritance, and encapsulation in JavaScript.",
        concepts: [
          "Classes",
          "Constructors",
          "Inheritance",
          "Getters/Setters",
          "Encapsulation",
        ],
        resources: [
          {
            title: "MDN Classes",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes",
          },
        ],
      },
      {
        id: "js-error-handling",
        title: "Error Handling & Debugging",
        subtitle: "Identify and fix issues",
        color: "#E91E63",
        description:
          "Learn techniques for debugging JavaScript code and handling errors gracefully.",
        concepts: [
          "Console API",
          "try/catch/finally",
          "throw Statement",
          "Debugger Statement",
          "Common Errors and Fixes",
        ],
        resources: [
          {
            title: "MDN Debugging Guide",
            url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises",
          },
        ],
      },
      {
        id: "js-best-practices",
        title: "JavaScript Best Practices",
        subtitle: "Write clean code",
        color: "#009688",
        description:
          "Learn how to write cleaner, more efficient JavaScript code using modern patterns and conventions.",
        concepts: [
          "Code Formatting",
          "Linting Tools (ESLint)",
          "Naming Conventions",
          "Separation of Concerns",
          "Performance Tips",
        ],
        resources: [
          {
            title: "Airbnb JavaScript Style Guide",
            url: "https://github.com/airbnb/javascript",
          },
        ],
      },
    ],
  },
  {
    id: "nodejs",
    name: "Node.js",
    iconUrl: "https://nodejs.org/static/images/logo.svg",
    itemsCount: 11,
    roadmapItems: [
      {
        id: "node-intro",
        title: "Introduction to Node.js",
        subtitle: "Understanding Node.js",
        color: "#68A063",
        description:
          "Node.js is a JavaScript runtime built on Chrome's V8 engine that allows you to run JavaScript on the server. It is designed for building scalable network applications using non-blocking I/O and an event-driven architecture.",
        concepts: [
          "What is Node.js?",
          "Non-blocking I/O and Event Loop",
          "Use Cases and Benefits",
          "Comparison with Traditional Servers",
          "Setting up a simple server",
        ],
        resources: [
          {
            title: "Node.js Official Documentation",
            url: "https://nodejs.org/en/docs/",
          },
          {
            title: "Introduction to Node.js on MDN",
            url: "https://developer.mozilla.org/en-US/docs/Glossary/Node.js",
          },
        ],
      },
      {
        id: "node-setup",
        title: "Environment Setup and Installation",
        subtitle: "Getting started with Node.js",
        color: "#2C3E50",
        description:
          "Learn how to install Node.js and npm, set up your development environment, and manage versions using tools like nvm.",
        concepts: [
          "Installing Node.js and npm",
          "Using Node Version Manager (nvm)",
          "Setting up IDEs and Editors",
          "Understanding package.json",
          "Introduction to npm and yarn",
        ],
        resources: [
          {
            title: "Node.js Download and Installation",
            url: "https://nodejs.org/en/download/",
          },
          {
            title: "nvm GitHub Repository",
            url: "https://github.com/nvm-sh/nvm",
          },
        ],
      },
      {
        id: "node-fundamentals",
        title: "Node.js Fundamentals",
        subtitle: "Core concepts and architecture",
        color: "#3498DB",
        description:
          "Dive into the core mechanics of Node.js including its event loop, asynchronous programming, modules, and global objects.",
        concepts: [
          "Event Loop and Asynchronous Programming",
          "Callbacks and Promises",
          "Understanding Modules (CommonJS vs ES Modules)",
          "Global Objects and Process",
          "Error Handling in Node.js",
        ],
        resources: [
          {
            title: "Understanding the Node.js Event Loop",
            url: "https://nodejs.dev/learn/the-nodejs-event-loop",
          },
          {
            title: "Node.js Modules Documentation",
            url: "https://nodejs.org/api/modules.html",
          },
        ],
      },
      {
        id: "node-modules",
        title: "Modules and Package Management",
        subtitle: "Working with npm and external packages",
        color: "#2980B9",
        description:
          "Learn how to manage and use modules, install packages via npm or yarn, and create your own modules to keep your code organized.",
        concepts: [
          "Using npm and yarn",
          "Managing package.json",
          "Semantic Versioning",
          "Local vs Global Installation",
          "Creating and Publishing Modules",
        ],
        resources: [
          {
            title: "npm Documentation",
            url: "https://docs.npmjs.com/",
          },
          {
            title: "Creating Node.js Modules",
            url: "https://nodejs.dev/learn/the-nodejs-module-system",
          },
        ],
      },
      {
        id: "node-fs-streams",
        title: "File System and Streams",
        subtitle: "Handling files and data streams",
        color: "#27AE60",
        description:
          "Understand how to interact with the file system using the fs module, manage buffers, and work with streams to efficiently handle large data.",
        concepts: [
          "Reading and Writing Files",
          "Using the fs Module",
          "Understanding Buffers",
          "Streams and Piping",
          "Error Handling with File Operations",
        ],
        resources: [
          {
            title: "Node.js File System (fs) Documentation",
            url: "https://nodejs.org/api/fs.html",
          },
          {
            title: "Streams in Node.js",
            url: "https://nodejs.dev/learn/understanding-streams",
          },
        ],
      },
      {
        id: "node-networking",
        title: "Networking and HTTP",
        subtitle: "Building network applications",
        color: "#8E44AD",
        description:
          "Learn to build network applications by creating HTTP servers, handling requests, and developing RESTful APIs using Node.js.",
        concepts: [
          "Creating HTTP Servers",
          "Handling Requests and Responses",
          "Routing and Middleware",
          "REST API Basics",
          "Working with WebSockets for Real-Time Communication",
        ],
        resources: [
          {
            title: "Node.js HTTP Module Documentation",
            url: "https://nodejs.org/api/http.html",
          },
          {
            title: "Building a Simple REST API with Node.js",
            url: "https://www.digitalocean.com/community/tutorials/nodejs-restful-api",
          },
        ],
      },
      {
        id: "node-express",
        title: "Express.js Framework",
        subtitle: "Building web applications and APIs",
        color: "#E67E22",
        description:
          "Master Express.js, the most popular Node.js framework, to build robust web servers and RESTful APIs with middleware support.",
        concepts: [
          "Express.js Installation and Setup",
          "Routing and Middleware",
          "Template Engines",
          "Error Handling in Express",
          "Security and Best Practices",
        ],
        resources: [
          {
            title: "Express.js Official Documentation",
            url: "https://expressjs.com/",
          },
          {
            title: "Express Tutorial: Building RESTful APIs",
            url: "https://www.tutorialspoint.com/expressjs/index.htm",
          },
        ],
      },
      {
        id: "node-database",
        title: "Database Integration",
        subtitle: "Connecting Node.js with databases",
        color: "#16A085",
        description:
          "Learn how to connect your Node.js applications to both SQL and NoSQL databases, manage data, and optimize queries.",
        concepts: [
          "Working with NoSQL (MongoDB, Mongoose)",
          "SQL Databases (PostgreSQL, MySQL)",
          "ORMs and ODMs (Sequelize, TypeORM)",
          "Connection Pooling",
          "Data Validation and Modeling",
        ],
        resources: [
          {
            title: "MongoDB Node.js Driver Documentation",
            url: "https://docs.mongodb.com/drivers/node/",
          },
          {
            title: "Sequelize Documentation",
            url: "https://sequelize.org/master/",
          },
        ],
      },
      {
        id: "node-testing",
        title: "Testing and Debugging",
        subtitle: "Ensuring code quality",
        color: "#9B59B6",
        description:
          "Explore various testing frameworks and debugging tools to write reliable code and catch issues early in your Node.js applications.",
        concepts: [
          "Unit Testing with Mocha or Jest",
          "Integration Testing",
          "Using Supertest for API Testing",
          "Debugging with Node Inspector",
          "Test-Driven Development (TDD)",
        ],
        resources: [
          {
            title: "Mocha Testing Framework",
            url: "https://mochajs.org/",
          },
          {
            title: "Jest Documentation",
            url: "https://jestjs.io/",
          },
        ],
      },
      {
        id: "node-advanced",
        title: "Advanced Node.js",
        subtitle: "Scaling and optimization",
        color: "#34495E",
        description:
          "Delve into advanced topics such as clustering, worker threads, and performance profiling to build high-performance, scalable applications.",
        concepts: [
          "Clustering and Load Balancing",
          "Worker Threads",
          "Performance Profiling and Monitoring",
          "Real-time Communication with Socket.io",
          "Microservices Architecture",
        ],
        resources: [
          {
            title: "Node.js Cluster Module",
            url: "https://nodejs.org/api/cluster.html",
          },
          {
            title: "Socket.io Documentation",
            url: "https://socket.io/docs/v4/",
          },
        ],
      },
      {
        id: "node-deployment",
        title: "Deployment and Best Practices",
        subtitle: "Production readiness",
        color: "#D35400",
        description:
          "Learn how to deploy your Node.js applications securely and efficiently, including environment configuration, logging, and monitoring in production.",
        concepts: [
          "Environment Variables and Configuration",
          "Security Best Practices",
          "Logging and Monitoring",
          "Containerization with Docker",
          "Cloud Deployment (AWS, Heroku, etc.)",
        ],
        resources: [
          {
            title: "Deploying Node.js Applications",
            url: "https://nodejs.org/en/docs/guides/deployment/",
          },
          {
            title: "Docker for Node.js",
            url: "https://nodejs.org/en/docs/guides/nodejs-docker-webapp/",
          },
        ],
      },
    ],
  },
  {
    id: "devops",
    name: "DevOps",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/DevOps_logo.svg/512px-DevOps_logo.svg.png",
    itemsCount: 11,
    roadmapItems: [
      {
        id: "devops-intro",
        title: "Introduction to DevOps",
        subtitle: "DevOps culture and fundamentals",
        color: "#1E90FF",
        description:
          "DevOps is a set of practices that automates and integrates the processes between software development and IT operations. It focuses on continuous integration, continuous delivery, and fostering a collaborative culture to deliver high-quality software faster.",
        concepts: [
          "DevOps culture",
          "Collaboration between development and operations",
          "Agile and Lean principles",
          "Continuous improvement",
          "Feedback loops",
        ],
        resources: [
          {
            title: "Atlassian: What is DevOps?",
            url: "https://www.atlassian.com/devops",
          },
          {
            title: "AWS: What is DevOps?",
            url: "https://aws.amazon.com/devops/what-is-devops/",
          },
        ],
      },
      {
        id: "version-control",
        title: "Version Control Systems",
        subtitle: "Mastering Git and collaboration",
        color: "#F1502F",
        description:
          "Version control is essential for collaboration and code management. Learn Git to track changes, manage branches, and collaborate effectively in teams.",
        concepts: [
          "Git basics",
          "Branching and merging",
          "Remote repositories",
          "Git workflows (GitFlow, GitHub Flow)",
          "Pull requests and code reviews",
        ],
        resources: [
          {
            title: "Git Documentation",
            url: "https://git-scm.com/doc",
          },
          {
            title: "Pro Git Book",
            url: "https://git-scm.com/book/en/v2",
          },
        ],
      },
      {
        id: "ci",
        title: "Continuous Integration (CI)",
        subtitle: "Automating builds and tests",
        color: "#4CAF50",
        description:
          "Implement CI pipelines to automatically build and test code changes, ensuring high quality and reducing integration issues.",
        concepts: [
          "CI pipelines",
          "Automated testing",
          "Build automation",
          "CI tools (Jenkins, Travis CI, CircleCI)",
          "Integration best practices",
        ],
        resources: [
          {
            title: "Jenkins Documentation",
            url: "https://www.jenkins.io/doc/",
          },
          {
            title: "CircleCI Docs",
            url: "https://circleci.com/docs/",
          },
        ],
      },
      {
        id: "cd",
        title: "Continuous Deployment/Delivery (CD)",
        subtitle: "Automating releases",
        color: "#FF8C00",
        description:
          "Implement CD pipelines to automate the release process, enabling frequent and reliable software delivery with minimal manual intervention.",
        concepts: [
          "Automated deployments",
          "Deployment strategies (Blue/Green, Canary releases)",
          "CD pipeline configuration",
          "Rollback strategies",
          "Release management",
        ],
        resources: [
          {
            title: "Azure DevOps Documentation",
            url: "https://docs.microsoft.com/en-us/azure/devops/",
          },
          {
            title: "AWS CodeDeploy",
            url: "https://aws.amazon.com/codedeploy/",
          },
        ],
      },
      {
        id: "containerization",
        title: "Containerization",
        subtitle: "Docker and container orchestration",
        color: "#2496ED",
        description:
          "Containerization allows you to package applications and their dependencies together. Learn Docker and explore orchestration tools like Kubernetes to manage containerized applications at scale.",
        concepts: [
          "Docker fundamentals",
          "Building and managing Docker images",
          "Docker Compose for multi-container applications",
          "Kubernetes basics",
          "Container orchestration best practices",
        ],
        resources: [
          {
            title: "Docker Documentation",
            url: "https://docs.docker.com/",
          },
          {
            title: "Kubernetes Official Site",
            url: "https://kubernetes.io/",
          },
        ],
      },
      {
        id: "config-management",
        title: "Configuration Management",
        subtitle: "Automating infrastructure configuration",
        color: "#FF6347",
        description:
          "Manage and automate configuration of your infrastructure using tools like Ansible, Chef, or Puppet to ensure consistency and repeatability across environments.",
        concepts: [
          "Configuration as Code",
          "Ansible basics",
          "Overview of Chef and Puppet",
          "Automated configuration management",
          "Infrastructure consistency",
        ],
        resources: [
          {
            title: "Ansible Documentation",
            url: "https://docs.ansible.com/",
          },
          {
            title: "Puppet Official Site",
            url: "https://puppet.com/docs/puppet/latest/puppet_index.html",
          },
        ],
      },
      {
        id: "iac",
        title: "Infrastructure as Code (IaC)",
        subtitle: "Automating infrastructure provisioning",
        color: "#2D9CDB",
        description:
          "Leverage IaC practices to manage and provision infrastructure through code, ensuring reproducibility, scalability, and version control.",
        concepts: [
          "Terraform fundamentals",
          "AWS CloudFormation",
          "Idempotency in IaC",
          "Versioning infrastructure",
          "Deployment automation",
        ],
        resources: [
          {
            title: "Terraform Documentation",
            url: "https://www.terraform.io/docs",
          },
          {
            title: "AWS CloudFormation",
            url: "https://aws.amazon.com/cloudformation/",
          },
        ],
      },
      {
        id: "monitoring-logging",
        title: "Monitoring and Logging",
        subtitle: "Ensuring system observability",
        color: "#9B59B6",
        description:
          "Implement monitoring and logging solutions to gain insights into system performance, detect issues early, and facilitate troubleshooting.",
        concepts: [
          "Monitoring tools (Prometheus, Grafana)",
          "Logging solutions (ELK stack, Splunk)",
          "Alerting and incident response",
          "Performance metrics",
          "System health checks",
        ],
        resources: [
          {
            title: "Prometheus Documentation",
            url: "https://prometheus.io/docs/",
          },
          {
            title: "ELK Stack Guide",
            url: "https://www.elastic.co/what-is/elk-stack",
          },
        ],
      },
      {
        id: "cloud-platforms",
        title: "Cloud Platforms",
        subtitle: "Leveraging cloud services in DevOps",
        color: "#F39C12",
        description:
          "Gain expertise in major cloud providers and learn how to integrate cloud services into your DevOps workflow for scalable, secure, and resilient deployments.",
        concepts: [
          "AWS fundamentals",
          "Azure basics",
          "Google Cloud Platform overview",
          "Cloud resource management",
          "Cloud security best practices",
        ],
        resources: [
          {
            title: "AWS DevOps",
            url: "https://aws.amazon.com/devops/",
          },
          {
            title: "Azure DevOps Documentation",
            url: "https://docs.microsoft.com/en-us/azure/devops/",
          },
        ],
      },
      {
        id: "security-compliance",
        title: "Security and Compliance",
        subtitle: "Integrating security into DevOps",
        color: "#C0392B",
        description:
          "Incorporate security best practices into your DevOps pipeline to protect applications, ensure compliance with regulations, and mitigate vulnerabilities.",
        concepts: [
          "DevSecOps principles",
          "Security scanning and vulnerability management",
          "Compliance standards",
          "Access control and identity management",
          "Incident response and remediation",
        ],
        resources: [
          {
            title: "OWASP Guidelines",
            url: "https://owasp.org/",
          },
          {
            title: "DevSecOps Best Practices",
            url: "https://www.ibm.com/cloud/blog/devsecops",
          },
        ],
      },
      {
        id: "collaboration-culture",
        title: "Collaboration and Culture",
        subtitle: "Building a DevOps mindset",
        color: "#27AE60",
        description:
          "Foster a culture of collaboration and continuous learning between development and operations teams. Emphasize communication, feedback, and agile practices to drive innovation and efficiency.",
        concepts: [
          "Agile and Lean principles",
          "Team collaboration tools",
          "Feedback loops",
          "Continuous learning",
          "Change management",
        ],
        resources: [
          {
            title: "The Phoenix Project",
            url: "https://www.amazon.com/Phoenix-Project-DevOps-Helping-Business/dp/0988262592",
          },
          {
            title: "The DevOps Handbook",
            url: "https://www.amazon.com/DevOps-Handbook-World-Class-Reliability-Organizations/dp/1942788002",
          },
        ],
      },
    ],
  }, //DAta Analytics
  {
    id: "data-analyst",
    name: "Data Analyst",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Data_analysis.svg/512px-Data_analysis.svg.png",
    itemsCount: 9,
    roadmapItems: [
      {
        id: "da-intro",
        title: "Introduction to Data Analysis",
        subtitle: "Overview of roles and process",
        color: "#3498DB",
        description:
          "Data analysis involves extracting insights from data to inform decision-making. This section introduces the responsibilities, methodologies, and key tools used in the field.",
        concepts: [
          "What is Data Analysis?",
          "Role of a Data Analyst",
          "Data analysis workflow",
          "Importance of data-driven decisions",
          "Overview of tools and techniques",
        ],
        resources: [
          {
            title: "Introduction to Data Analysis - Coursera",
            url: "https://www.coursera.org/learn/data-analysis",
          },
          {
            title: "What Does a Data Analyst Do?",
            url: "https://www.investopedia.com/terms/d/data-analyst.asp",
          },
        ],
      },
      {
        id: "da-excel",
        title: "Excel and Spreadsheets",
        subtitle: "Essential tools for data manipulation",
        color: "#2ECC71",
        description:
          "Excel is a fundamental tool for data analysis. Learn to manipulate data, perform calculations, and create visual reports using spreadsheets.",
        concepts: [
          "Excel formulas and functions",
          "Data cleaning and transformation",
          "Pivot tables and charts",
          "Conditional formatting",
          "Basic macros and automation",
        ],
        resources: [
          {
            title: "Excel for Data Analysis",
            url: "https://support.microsoft.com/en-us/excel",
          },
          {
            title: "Excel Data Analysis Tutorial",
            url: "https://www.excel-easy.com/data-analysis.html",
          },
        ],
      },
      {
        id: "da-statistics",
        title: "Statistics and Probability",
        subtitle: "Understanding data through numbers",
        color: "#F1C40F",
        description:
          "Grasping statistical concepts is crucial for interpreting data. Learn descriptive and inferential statistics, probability, and hypothesis testing.",
        concepts: [
          "Descriptive statistics",
          "Inferential statistics",
          "Probability theory",
          "Hypothesis testing",
          "Regression analysis",
        ],
        resources: [
          {
            title: "Statistics for Data Science - Khan Academy",
            url: "https://www.khanacademy.org/math/statistics-probability",
          },
          {
            title: "Intro to Statistics - Udacity",
            url: "https://www.udacity.com/course/intro-to-statistics--st101",
          },
        ],
      },
      {
        id: "da-sql",
        title: "SQL and Database Management",
        subtitle: "Querying and managing data",
        color: "#E67E22",
        description:
          "SQL is essential for extracting and managing data stored in relational databases. Learn to write queries that extract, filter, and aggregate data effectively.",
        concepts: [
          "SQL basics and syntax",
          "SELECT, JOIN, WHERE clauses",
          "Aggregation and grouping",
          "Subqueries and nested queries",
          "Database design fundamentals",
        ],
        resources: [
          {
            title: "SQL Tutorial - W3Schools",
            url: "https://www.w3schools.com/sql/",
          },
          {
            title: "Learn SQL - Codecademy",
            url: "https://www.codecademy.com/learn/learn-sql",
          },
        ],
      },
      {
        id: "da-cleaning",
        title: "Data Cleaning and Wrangling",
        subtitle: "Preparing data for analysis",
        color: "#9B59B6",
        description:
          "Raw data often needs cleaning and transformation. Learn techniques to handle missing data, normalize values, and prepare datasets for accurate analysis.",
        concepts: [
          "Data quality and preprocessing",
          "Handling missing or inconsistent data",
          "Data normalization and transformation",
          "Using tools like Python's Pandas",
          "Data integration from multiple sources",
        ],
        resources: [
          {
            title: "Data Wrangling with Pandas",
            url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html",
          },
          {
            title: "Data Cleaning Techniques",
            url: "https://towardsdatascience.com/the-art-of-data-cleaning-3dc5e4e33e3f",
          },
        ],
      },
      {
        id: "da-visualization",
        title: "Data Visualization",
        subtitle: "Communicating insights visually",
        color: "#E74C3C",
        description:
          "Visualizing data is key to uncovering trends and insights. Learn how to create compelling charts, graphs, and dashboards using various visualization tools.",
        concepts: [
          "Principles of effective data visualization",
          "Creating charts and graphs",
          "Visualization tools (Tableau, Power BI, Matplotlib)",
          "Dashboard design",
          "Interactive visualizations",
        ],
        resources: [
          {
            title: "Data Visualization with Tableau",
            url: "https://www.tableau.com/learn/training",
          },
          {
            title: "Matplotlib Tutorial",
            url: "https://matplotlib.org/stable/tutorials/index.html",
          },
        ],
      },
      {
        id: "da-programming",
        title: "Programming for Data Analysis",
        subtitle: "Leveraging Python and R",
        color: "#3498DB",
        description:
          "Programming languages like Python and R offer powerful libraries for data analysis. Learn to automate data tasks and perform complex analyses using these languages.",
        concepts: [
          "Python fundamentals for data analysis",
          "Using Pandas and NumPy for data manipulation",
          "Visualization libraries (Seaborn, Matplotlib)",
          "R basics and the tidyverse",
          "Automating data analysis workflows",
        ],
        resources: [
          {
            title: "Python for Data Analysis",
            url: "https://www.oreilly.com/library/view/python-for-data/9781491957653/",
          },
          {
            title: "R for Data Science",
            url: "https://r4ds.had.co.nz/",
          },
        ],
      },
      {
        id: "da-reporting",
        title: "Reporting and Communication",
        subtitle: "Presenting data insights effectively",
        color: "#2ECC71",
        description:
          "Translating data insights into actionable reports is vital. Learn how to create reports, dashboards, and presentations that effectively communicate your findings to stakeholders.",
        concepts: [
          "Creating data-driven reports",
          "Dashboard design and tools",
          "Storytelling with data",
          "Effective presentation techniques",
          "Data-driven decision making",
        ],
        resources: [
          {
            title: "Data Storytelling Guide - Tableau",
            url: "https://www.tableau.com/learn/articles/data-storytelling",
          },
          {
            title: "Effective Data Communication - Coursera",
            url: "https://www.coursera.org/learn/communication-data",
          },
        ],
      },
      {
        id: "da-advanced",
        title: "Advanced Topics and Tools",
        subtitle: "Expanding your analytical skills",
        color: "#8E44AD",
        description:
          "Once you've mastered the basics, explore advanced analytics techniques such as machine learning, big data processing, and predictive analytics to further enhance your skill set.",
        concepts: [
          "Introduction to machine learning for analysts",
          "Big data tools (Hadoop, Spark)",
          "Advanced statistical modeling",
          "Predictive analytics",
          "Natural Language Processing (NLP)",
        ],
        resources: [
          {
            title: "Machine Learning Basics - Coursera",
            url: "https://www.coursera.org/learn/machine-learning",
          },
          {
            title: "Big Data Analysis with Spark",
            url: "https://spark.apache.org/docs/latest/",
          },
        ],
      },
    ],
  },
  {
    id: "ai-ml",
    name: "AI & ML",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Artificial_intelligence_logo.svg/512px-Artificial_intelligence_logo.svg.png",
    itemsCount: 9,
    roadmapItems: [
      {
        id: "aiml-intro",
        title: "Introduction to AI & ML",
        subtitle: "Foundations and Key Concepts",
        color: "#1ABC9C",
        description:
          "Get an overview of Artificial Intelligence and Machine Learning, including their definitions, history, real-world applications, and ethical considerations.",
        concepts: [
          "Definition of AI and ML",
          "Historical evolution",
          "Types of learning: supervised, unsupervised, reinforcement",
          "Applications across industries",
          "Ethical considerations and biases",
        ],
        resources: [
          {
            title: "AI For Everyone - Coursera",
            url: "https://www.coursera.org/learn/ai-for-everyone",
          },
          {
            title: "Introduction to AI - edX",
            url: "https://www.edx.org/course/artificial-intelligence-ai",
          },
        ],
      },
      {
        id: "aiml-math",
        title: "Mathematics & Statistics",
        subtitle: "Foundational Math for AI",
        color: "#3498DB",
        description:
          "Build a strong foundation in mathematics and statistics, which are crucial for understanding and developing machine learning algorithms.",
        concepts: [
          "Linear Algebra (vectors, matrices)",
          "Calculus (derivatives, integrals, gradients)",
          "Probability theory",
          "Descriptive and inferential statistics",
          "Optimization techniques (gradient descent)",
        ],
        resources: [
          {
            title: "Khan Academy: Linear Algebra",
            url: "https://www.khanacademy.org/math/linear-algebra",
          },
          {
            title: "Introduction to Statistics - Coursera",
            url: "https://www.coursera.org/learn/statistics",
          },
        ],
      },
      {
        id: "aiml-programming",
        title: "Programming for AI & ML",
        subtitle: "Python and Essential Libraries",
        color: "#E67E22",
        description:
          "Focus on Python—the primary language for AI. Learn to leverage libraries for data manipulation, numerical computation, and visualization.",
        concepts: [
          "Python fundamentals",
          "Data manipulation with Pandas",
          "Numerical computing with NumPy",
          "Data visualization using Matplotlib and Seaborn",
          "Working in Jupyter Notebooks",
        ],
        resources: [
          {
            title: "Python for Data Science - Coursera",
            url: "https://www.coursera.org/specializations/python-data-science",
          },
          {
            title: "NumPy Quickstart Tutorial",
            url: "https://numpy.org/doc/stable/user/quickstart.html",
          },
        ],
      },
      {
        id: "aiml-data-preprocessing",
        title: "Data Collection & Preprocessing",
        subtitle: "Preparing Data for Analysis",
        color: "#9B59B6",
        description:
          "Learn to gather, clean, and transform data—an essential step to ensure accurate and effective machine learning models.",
        concepts: [
          "Data collection methods and sources",
          "Data cleaning techniques",
          "Handling missing and inconsistent data",
          "Feature engineering and scaling",
          "Exploratory Data Analysis (EDA)",
        ],
        resources: [
          {
            title: "Data Preprocessing in Python",
            url: "https://realpython.com/python-data-cleaning-numpy-pandas/",
          },
          {
            title: "Feature Engineering Guide",
            url: "https://www.analyticsvidhya.com/blog/2018/02/guide-feature-engineering/",
          },
        ],
      },
      {
        id: "aiml-ml-fundamentals",
        title: "Machine Learning Fundamentals",
        subtitle: "Core Algorithms and Techniques",
        color: "#2ECC71",
        description:
          "Dive into fundamental machine learning algorithms and techniques, covering both regression and classification as well as clustering methods.",
        concepts: [
          "Supervised learning: regression and classification",
          "Unsupervised learning: clustering and dimensionality reduction",
          "Evaluation metrics (accuracy, precision, recall, F1 score)",
          "Overfitting and underfitting",
          "Cross-validation techniques",
        ],
        resources: [
          {
            title: "Machine Learning by Andrew Ng - Coursera",
            url: "https://www.coursera.org/learn/machine-learning",
          },
          {
            title:
              "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
            url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",
          },
        ],
      },
      {
        id: "aiml-deep-learning",
        title: "Deep Learning",
        subtitle: "Neural Networks and Advanced Architectures",
        color: "#E74C3C",
        description:
          "Explore deep learning techniques, including neural network architectures that power state-of-the-art applications in vision, speech, and more.",
        concepts: [
          "Basics of neural networks",
          "Convolutional Neural Networks (CNNs)",
          "Recurrent Neural Networks (RNNs) and LSTM",
          "Generative Adversarial Networks (GANs)",
          "Transfer learning and fine-tuning",
        ],
        resources: [
          {
            title: "Deep Learning Specialization - Coursera",
            url: "https://www.coursera.org/specializations/deep-learning",
          },
          {
            title: "DeepLearning.ai",
            url: "https://www.deeplearning.ai/",
          },
        ],
      },
      {
        id: "aiml-nlp",
        title: "Natural Language Processing (NLP)",
        subtitle: "Text Analysis and Language Models",
        color: "#3498DB",
        description:
          "Learn how to process and analyze textual data. Discover techniques in tokenization, sentiment analysis, and modern transformer-based models.",
        concepts: [
          "Text preprocessing and tokenization",
          "Sentiment analysis",
          "Word embeddings (Word2Vec, GloVe)",
          "Sequence models and transformers",
          "Applications: chatbots, translation, summarization",
        ],
        resources: [
          {
            title: "NLTK Official Documentation",
            url: "https://www.nltk.org/",
          },
          {
            title: "Hugging Face Transformers",
            url: "https://huggingface.co/transformers/",
          },
        ],
      },
      {
        id: "aiml-computer-vision",
        title: "Computer Vision",
        subtitle: "Image Processing and Analysis",
        color: "#F1C40F",
        description:
          "Explore techniques that enable computers to interpret and process visual information, including image classification, object detection, and segmentation.",
        concepts: [
          "Image preprocessing and augmentation",
          "Convolutional Neural Networks for image classification",
          "Object detection algorithms (YOLO, SSD)",
          "Image segmentation methods",
          "Practical applications in computer vision",
        ],
        resources: [
          {
            title: "Computer Vision Basics - Coursera",
            url: "https://www.coursera.org/learn/computer-vision",
          },
          {
            title: "OpenCV Documentation",
            url: "https://docs.opencv.org/",
          },
        ],
      },
      {
        id: "aiml-mlops",
        title: "Model Deployment & MLOps",
        subtitle: "Operationalizing AI Models",
        color: "#34495E",
        description:
          "Learn how to deploy machine learning models into production, manage the model lifecycle, and implement continuous integration/continuous deployment (CI/CD) for AI applications.",
        concepts: [
          "Model deployment strategies",
          "Containerization with Docker",
          "Cloud services for ML (AWS, GCP, Azure)",
          "MLOps principles and workflows",
          "Monitoring, versioning, and updating models",
        ],
        resources: [
          {
            title:
              "MLOps: Continuous Delivery and Automation Pipelines in Machine Learning",
            url: "https://www.oreilly.com/library/view/mlops-continuous-delivery/9781098115784/",
          },
          {
            title: "TensorFlow Serving",
            url: "https://www.tensorflow.org/tfx/guide/serving",
          },
        ],
      },
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Cybersecurity-icon.svg/512px-Cybersecurity-icon.svg.png",
    itemsCount: 10,
    roadmapItems: [
      {
        id: "cs-intro",
        title: "Introduction to Cybersecurity",
        subtitle: "Overview and Key Concepts",
        color: "#1ABC9C",
        description:
          "Get an introduction to cybersecurity, including its importance in protecting information systems, common threats, and an overview of security principles.",
        concepts: [
          "Definition of cybersecurity",
          "Importance of data protection",
          "Cyber threats and vulnerabilities",
          "History and evolution of cybersecurity",
          "Roles and responsibilities in cybersecurity",
        ],
        resources: [
          {
            title: "Introduction to Cybersecurity - Cisco",
            url: "https://www.cisco.com/c/en/us/products/security/what-is-cybersecurity.html",
          },
          {
            title: "Cybersecurity Basics - Coursera",
            url: "https://www.coursera.org/learn/intro-cyber-security",
          },
        ],
      },
      {
        id: "cs-fundamentals",
        title: "Security Fundamentals",
        subtitle: "Principles and Best Practices",
        color: "#3498DB",
        description:
          "Learn the core principles of cybersecurity, including the CIA triad (Confidentiality, Integrity, Availability), risk management, and security policies.",
        concepts: [
          "CIA Triad (Confidentiality, Integrity, Availability)",
          "Security policies and procedures",
          "Risk management and assessment",
          "Security controls and countermeasures",
          "Compliance and regulatory standards (ISO, NIST)",
        ],
        resources: [
          {
            title: "Cybersecurity Fundamentals - edX",
            url: "https://www.edx.org/course/cybersecurity-fundamentals",
          },
        ],
      },
      {
        id: "cs-cryptography",
        title: "Cryptography",
        subtitle: "Encryption and Secure Communications",
        color: "#E67E22",
        description:
          "Understand the basics of cryptography, including encryption algorithms, hashing, and secure communication protocols essential for data protection.",
        concepts: [
          "Symmetric and Asymmetric encryption",
          "Hash functions and digital signatures",
          "Public Key Infrastructure (PKI)",
          "SSL/TLS protocols",
          "Cryptographic best practices",
        ],
        resources: [
          {
            title: "Cryptography Basics - Khan Academy",
            url: "https://www.khanacademy.org/computing/computer-science/cryptography",
          },
        ],
      },
      {
        id: "cs-network-security",
        title: "Network Security",
        subtitle: "Protecting Data in Transit",
        color: "#9B59B6",
        description:
          "Learn how to secure networks and communications with firewalls, VPNs, and intrusion detection systems to safeguard data during transmission.",
        concepts: [
          "Firewalls and network segmentation",
          "Virtual Private Networks (VPNs)",
          "Intrusion Detection and Prevention Systems (IDS/IPS)",
          "Secure network protocols (HTTPS, SSH)",
          "Wireless network security",
        ],
        resources: [
          {
            title: "Network Security Basics - Cisco",
            url: "https://www.cisco.com/c/en/us/products/security/what-is-network-security.html",
          },
        ],
      },
      {
        id: "cs-web-security",
        title: "Web Security",
        subtitle: "Securing Web Applications",
        color: "#E74C3C",
        description:
          "Focus on protecting web applications by learning about common vulnerabilities and implementing secure coding practices, guided by OWASP principles.",
        concepts: [
          "OWASP Top 10 vulnerabilities",
          "Cross-Site Scripting (XSS)",
          "SQL Injection",
          "Cross-Site Request Forgery (CSRF)",
          "Secure coding practices",
        ],
        resources: [
          {
            title: "OWASP Top 10",
            url: "https://owasp.org/www-project-top-ten/",
          },
        ],
      },
      {
        id: "cs-endpoint-security",
        title: "Endpoint Security",
        subtitle: "Securing Devices and Systems",
        color: "#2ECC71",
        description:
          "Learn about securing endpoints such as computers and mobile devices using antivirus, anti-malware solutions, and endpoint detection and response strategies.",
        concepts: [
          "Antivirus and anti-malware solutions",
          "Endpoint detection and response (EDR)",
          "Patch management",
          "Mobile device security",
          "Endpoint monitoring and management",
        ],
        resources: [
          {
            title: "Endpoint Security Best Practices - CSO Online",
            url: "https://www.csoonline.com/article/3533630/endpoint-security-best-practices.html",
          },
        ],
      },
      {
        id: "cs-incident-response",
        title: "Incident Response & Forensics",
        subtitle: "Managing and Investigating Incidents",
        color: "#F39C12",
        description:
          "Develop skills in incident response and digital forensics to effectively manage security breaches and conduct post-incident analysis and recovery.",
        concepts: [
          "Incident response planning and execution",
          "Digital forensics fundamentals",
          "Log analysis and monitoring",
          "Containment and remediation strategies",
          "Post-incident review and reporting",
        ],
        resources: [
          {
            title: "Incident Response - NIST",
            url: "https://www.nist.gov/cyberframework/incident-response",
          },
        ],
      },
      {
        id: "cs-security-ops",
        title: "Security Operations & Monitoring",
        subtitle: "Continuous Threat Monitoring",
        color: "#34495E",
        description:
          "Focus on the tools and practices used in Security Operations Centers (SOCs) for continuous monitoring, threat detection, and proactive defense.",
        concepts: [
          "Security Information and Event Management (SIEM)",
          "Log aggregation and analysis",
          "Threat intelligence and hunting",
          "Vulnerability scanning",
          "Security monitoring tools",
        ],
        resources: [
          {
            title: "SIEM Explained - Splunk",
            url: "https://www.splunk.com/en_us/solutions/what-is-siem.html",
          },
        ],
      },
      {
        id: "cs-compliance",
        title: "Compliance & Governance",
        subtitle: "Regulatory and Best Practice Frameworks",
        color: "#27AE60",
        description:
          "Understand the importance of compliance with regulatory standards and governance frameworks, and learn to implement policies to ensure data privacy and security.",
        concepts: [
          "Regulatory standards (GDPR, HIPAA, PCI-DSS)",
          "Security governance frameworks (NIST, ISO 27001)",
          "Risk assessment and management",
          "Policy development and enforcement",
          "Audit and compliance processes",
        ],
        resources: [
          {
            title: "NIST Cybersecurity Framework",
            url: "https://www.nist.gov/cyberframework",
          },
        ],
      },
      {
        id: "cs-advanced",
        title: "Advanced Cybersecurity Topics",
        subtitle: "Emerging Trends and Technologies",
        color: "#8E44AD",
        description:
          "Explore advanced topics in cybersecurity, including threat hunting, cloud security, zero trust architectures, and the role of AI in modern defense strategies.",
        concepts: [
          "Threat hunting techniques",
          "Cloud security challenges and solutions",
          "Zero Trust security model",
          "Cybersecurity automation and AI",
          "Advanced persistent threats (APTs)",
        ],
        resources: [
          {
            title: "Zero Trust Security - Microsoft",
            url: "https://www.microsoft.com/en-us/security/business/zero-trust",
          },
        ],
      },
    ],
  },
  {
    id: "blockchain",
    name: "Blockchain",
    iconUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/512px-Bitcoin.svg.png",
    itemsCount: 9,
    roadmapItems: [
      {
        id: "blockchain-intro",
        title: "Introduction to Blockchain",
        subtitle: "Understanding the Basics",
        color: "#1ABC9C",
        description:
          "Get an overview of blockchain technology, including its definition, history, and how it revolutionizes data storage and transactions by enabling decentralized trust.",
        concepts: [
          "What is blockchain?",
          "History and evolution",
          "Decentralization and distributed ledger",
          "Blockchain vs traditional databases",
          "Bitcoin as the first blockchain application",
        ],
        resources: [
          {
            title: "Blockchain Basics - IBM",
            url: "https://www.ibm.com/topics/what-is-blockchain",
          },
          {
            title: "Blockchain Explained - Investopedia",
            url: "https://www.investopedia.com/terms/b/blockchain.asp",
          },
        ],
      },
      {
        id: "blockchain-cryptography",
        title: "Cryptography for Blockchain",
        subtitle: "Securing Data with Cryptography",
        color: "#3498DB",
        description:
          "Learn the cryptographic principles that secure blockchain technology, including hash functions, public-key cryptography, and digital signatures.",
        concepts: [
          "Hash functions (e.g., SHA-256)",
          "Public-key cryptography",
          "Digital signatures",
          "Merkle trees",
          "Cryptographic security and immutability",
        ],
        resources: [
          {
            title: "Cryptography Basics - Khan Academy",
            url: "https://www.khanacademy.org/computing/computer-science/cryptography",
          },
          {
            title: "Understanding Hash Functions",
            url: "https://www.cloudflare.com/learning/ssl/how-does-sha-256-work/",
          },
        ],
      },
      {
        id: "blockchain-consensus",
        title: "Consensus Mechanisms",
        subtitle: "Achieving Agreement in a Distributed Network",
        color: "#E67E22",
        description:
          "Explore how blockchain networks reach consensus on the state of the ledger using various mechanisms that ensure trust and security without a central authority.",
        concepts: [
          "Proof of Work (PoW)",
          "Proof of Stake (PoS)",
          "Delegated Proof of Stake (DPoS)",
          "Byzantine Fault Tolerance (BFT)",
          "Consensus trade-offs and scalability",
        ],
        resources: [
          {
            title: "Consensus Mechanisms - CoinDesk",
            url: "https://www.coindesk.com/learn/consensus-algorithms-explained",
          },
        ],
      },
      {
        id: "blockchain-smart-contracts",
        title: "Smart Contracts",
        subtitle: "Automating Agreements",
        color: "#9B59B6",
        description:
          "Learn how smart contracts enable programmable transactions on blockchain networks. Understand their development, deployment, and use in decentralized applications.",
        concepts: [
          "What are smart contracts?",
          "Smart contract languages (Solidity, Vyper)",
          "Development tools (Truffle, Hardhat)",
          "Deployment on Ethereum and other platforms",
          "Security best practices for smart contracts",
        ],
        resources: [
          {
            title: "Ethereum Smart Contract Best Practices",
            url: "https://consensys.github.io/smart-contract-best-practices/",
          },
          {
            title: "Solidity Documentation",
            url: "https://docs.soliditylang.org/en/v0.8.17/",
          },
        ],
      },
      {
        id: "blockchain-dapps",
        title: "Decentralized Applications (DApps)",
        subtitle: "Building on Blockchain",
        color: "#2ECC71",
        description:
          "Discover how to develop decentralized applications that leverage blockchain technology to create trustless, transparent, and secure digital services.",
        concepts: [
          "Architecture of DApps",
          "Frontend and smart contract integration",
          "Decentralized storage solutions (IPFS)",
          "DApp development frameworks",
          "Case studies of popular DApps",
        ],
        resources: [
          {
            title: "DApp University",
            url: "https://www.dappuniversity.com/",
          },
          {
            title: "Ethereum DApps",
            url: "https://ethereum.org/en/developers/tutorials/",
          },
        ],
      },
      {
        id: "blockchain-platforms",
        title: "Blockchain Platforms",
        subtitle: "Exploring Leading Networks",
        color: "#F1C40F",
        description:
          "Compare different blockchain platforms and understand their unique features, consensus models, and ecosystems. Learn which platform suits various use cases.",
        concepts: [
          "Bitcoin vs Ethereum",
          "Permissioned vs Permissionless blockchains",
          "Hyperledger Fabric and Corda",
          "Emerging platforms (Cardano, Polkadot)",
          "Ecosystem and community support",
        ],
        resources: [
          {
            title: "A Guide to Blockchain Platforms",
            url: "https://builtin.com/blockchain/blockchain-platforms",
          },
        ],
      },
      {
        id: "blockchain-security",
        title: "Blockchain Security",
        subtitle: "Ensuring Network Integrity",
        color: "#C0392B",
        description:
          "Focus on security challenges specific to blockchain technology, including vulnerabilities, attack vectors, and strategies for secure system design.",
        concepts: [
          "51% attacks and double-spending",
          "Smart contract vulnerabilities",
          "Security audits and formal verification",
          "Cryptoeconomic incentives and game theory",
          "Network resilience and fault tolerance",
        ],
        resources: [
          {
            title: "Blockchain Security Guide",
            url: "https://blog.chainsecurity.com/",
          },
        ],
      },
      {
        id: "blockchain-scaling",
        title: "Scaling & Interoperability",
        subtitle: "Beyond the Basics",
        color: "#34495E",
        description:
          "Examine advanced topics aimed at addressing blockchain scalability and interoperability issues, ensuring efficient and connected networks.",
        concepts: [
          "Layer 2 solutions (Lightning Network, Plasma)",
          "Sidechains and off-chain scaling",
          "Sharding and partitioning",
          "Cross-chain communication protocols",
          "Interoperability challenges and solutions",
        ],
        resources: [
          {
            title: "Understanding Blockchain Scaling",
            url: "https://www.coindesk.com/learn/what-is-layer-2-scaling/",
          },
        ],
      },
      {
        id: "blockchain-use-cases",
        title: "Blockchain Use Cases",
        subtitle: "Real-World Applications",
        color: "#8E44AD",
        description:
          "Explore diverse applications of blockchain technology across industries, from finance and supply chain to identity management and decentralized finance (DeFi).",
        concepts: [
          "Cryptocurrencies and digital assets",
          "Decentralized Finance (DeFi)",
          "Supply chain transparency",
          "Digital identity and authentication",
          "Non-Fungible Tokens (NFTs)",
        ],
        resources: [
          {
            title: "Blockchain Use Cases - Deloitte",
            url: "https://www2.deloitte.com/global/en/pages/consulting/articles/blockchain-use-cases.html",
          },
        ],
      },
    ],
  },
];

// Helper function to find a roadmap item by ID
const findRoadmapItemById = (id) => {
  for (const tech of technologies) {
    const item = tech.roadmapItems.find((item) => item.id === id);
    if (item) return item;
  }
  return null;
};

export { technologies, findRoadmapItemById };
