import { createClient } from "redis"
import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import cluster from "cluster"

const numCPUs = 3

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork()
    console.log(`Worker ${worker.process.pid} started`)
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
    console.log("Starting a new worker")
    const newWorker = cluster.fork()
    console.log(`Worker ${newWorker.process.pid} started`)
  })
} else {
  const client = createClient({
    url: "redis://127.0.0.1:6379"
  })
  const pubClient = createClient({
    url: "redis://127.0.0.1:6379"
  })

  async function processSubmission(submission) {
    const { code, language, roomId, submissionId, input } = JSON.parse(
      submission
    )
    console.log(
      `Processing submission for room id: ${roomId}, submission id: ${submissionId}`
    )

    // Create unique directory for code execution
    const absoluteCodeDir = path.resolve(`./tmp/user-${Date.now()}`)
    await fs.mkdir(absoluteCodeDir, { recursive: true })

    let codeFilePath = ""
    let dockerCommand = ""
    const inputFilePath = path.join(absoluteCodeDir, "input.txt")

    try {
      // Write input file
      await fs.writeFile(inputFilePath, input, "utf8")

      // Generate code file and Docker command based on language
      switch (language) {
        case "javascript":
          codeFilePath = path.join(absoluteCodeDir, "userCode.js")
          await fs.writeFile(codeFilePath, code)
          dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(
            /\\/g,
            "/"
          )}:/usr/src/app" node:18 sh -c "node /usr/src/app/${path.basename(
            codeFilePath
          )} /usr/src/app/input.txt"`
          break

        case "python":
          codeFilePath = path.join(absoluteCodeDir, "userCode.py")
          await fs.writeFile(codeFilePath, code)
          dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(
            /\\/g,
            "/"
          )}:/usr/src/app" python:3.9 sh -c "python /usr/src/app/${path.basename(
            codeFilePath
          )} /usr/src/app/input.txt"`
          break

        case "cpp":
          codeFilePath = path.join(absoluteCodeDir, "userCode.cpp")
          await fs.writeFile(codeFilePath, code)
          dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 \
-v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" gcc:11  \
sh -c "g++ /usr/src/app/userCode.cpp -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`
          break

        case "rust":
          codeFilePath = path.join(absoluteCodeDir, "userCode.rs")
          await fs.writeFile(codeFilePath, code)
          dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" rust:latest sh -c "rustc /usr/src/app/userCode.rs -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`
          break

        case "java":
          codeFilePath = path.join(absoluteCodeDir, "UserCode.java")
          await fs.writeFile(codeFilePath, code)
          dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" openjdk:17 sh -c "javac /usr/src/app/UserCode.java && java -cp /usr/src/app UserCode < /usr/src/app/input.txt"`
          break

        case "go":
          codeFilePath = path.join(absoluteCodeDir, "userCode.go")
          await fs.writeFile(codeFilePath, code)
          dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" golang:1.18 sh -c "go run /usr/src/app/userCode.go < /usr/src/app/input.txt"`
          break

        default:
          throw new Error("Unsupported language")
      }
    } catch (error) {
      console.error("Failed to prepare code file or Docker command:", error)
      return
    }

    // Execute Docker command
    exec(dockerCommand, async (error, stdout, stderr) => {
      let result = stdout || stderr
      if (error) {
        result = `Error: ${error.message}`
      }
      console.log(`Result for room ${roomId}: ${result}`)

      try {
        await pubClient.publish(roomId, result)
      } catch (err) {
        console.error("Failed to publish result to Redis:", err)
      }

      // Clean up by removing the created directory
      try {
        await fs.rm(absoluteCodeDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error("Failed to clean up directory:", cleanupError)
      }
    })
  }

  async function main() {
    try {
      await client.connect()
      await pubClient.connect()
      console.log("Redis Client Connected")

      while (true) {
        const submission = await client.brPop("problems", 0)
        console.log("Processing submission...")
        if (submission) {
          await processSubmission(submission.element)
        }
      }
    } catch (error) {
      console.error("Failed to connect to Redis:", error)
    }
  }

  main()
}




























// import { createClient } from "redis";
// import { exec } from "child_process";
// import fs from "fs/promises";
// import path from "path";
// import os from "os";
// import cluster from "cluster";

// const numCPUs = os.cpus().length;

// if (cluster.isPrimary) {
//   console.log(`Master ${process.pid} is running`);
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });
// } else {
//   const client = createClient({ url: "redis://127.0.0.1:6379" });
//   const pubClient = createClient({ url: "redis://127.0.0.1:6379" });

//   // Enhanced Docker configuration
//   const DOCKER_CONFIG = {
//     python: {
//       image: "python:3.9-slim",
//       command: (file) => `cd /usr/src/app && python ${file} < input.txt`,
//       filename: "userCode.py"
//     },
//     javascript: {
//       image: "node:18",
//       command: (file) => `cd /usr/src/app && node ${file} < input.txt`,
//       filename: "userCode.js"
//     },
//     cpp: {
//       image: "gcc:11",
//       command: (file) => `cd /usr/src/app && g++ ${file} -o a.out && ./a.out < input.txt`,
//       filename: "userCode.cpp"
//     },
//     java: {
//       image: "openjdk:17-jdk-slim",
//       command: (file) => `cd /usr/src/app && javac ${file} && java ${file.replace('.java', '')} < input.txt`,
//       filename: "UserCode.java"
//     },
//     go: {
//       image: "golang:1.18",
//       command: (file) => `cd /usr/src/app && go run ${file} < input.txt`,
//       filename: "userCode.go"
//     },
//     rust: {
//       image: "rust:latest-slim",
//       command: (file) => `cd /usr/src/app && rustc ${file} -o a.out && ./a.out < input.txt`,
//       filename: "userCode.rs"
//     }
//   };

//   async function checkDocker() {
//     return new Promise((resolve) => {
//       exec("docker info", { timeout: 5000 }, (error) => {
//         if (error) {
//           console.error("Docker check failed:", error.message);
//           resolve(false);
//         } else {
//           resolve(true);
//         }
//       });
//     });
//   }

//   async function ensureDockerImage(config) {
//     return new Promise((resolve, reject) => {
//       exec(`docker inspect --type=image ${config.image}`, (error) => {
//         if (error) {
//           console.log(`Pulling Docker image: ${config.image}`);
//           const pull = exec(`docker pull ${config.image}`, 
//             { timeout: 120000 },
//             (pullError) => {
//               if (pullError) {
//                 console.error(`Failed to pull ${config.image}:`, pullError.message);
//                 reject(new Error(`Failed to pull Docker image: ${config.image}`));
//               } else {
//                 resolve();
//               }
//             }
//           );
//           pull.stdout.on('data', (data) => console.log(data.trim()));
//           pull.stderr.on('data', (data) => console.error(data.trim()));
//         } else {
//           resolve();
//         }
//       });
//     });
//   }

// async function processSubmission(submission) {
//   const { code, language, roomId, submissionId, input } = JSON.parse(submission);
//   console.log(`Processing Python submission for room: ${roomId}`);

//   // Create temp directory
//   const tempDir = path.join(process.cwd(), "tmp", `py-exec-${Date.now()}`);
//   await fs.mkdir(tempDir, { recursive: true });

//   try {
//     // Write files
//     const codeFile = path.join(tempDir, "userCode.py");
//     const inputFile = path.join(tempDir, "input.txt");
//     await fs.writeFile(codeFile, code);
//     await fs.writeFile(inputFile, input || "");

//     console.log(`Files created:\n- ${codeFile}\n- ${inputFile}`);

//     // Create a simple execution script to avoid command parsing issues
//     const execScript = path.join(tempDir, "execute.sh");
//     await fs.writeFile(execScript, 
//       `#!/bin/sh
//       cd /usr/src/app
//       echo "=== PYTHON VERSION ==="
//       python --version
//       echo "=== WORKING DIR CONTENTS ==="
//       ls -la
//       echo "=== CODE CONTENTS ==="
//       cat userCode.py
//       echo "=== EXECUTION START ==="
//       python -u userCode.py
//       echo "=== EXECUTION END ==="
//       `);

//     // Make script executable
//     await fs.chmod(execScript, 0o755);

//     // Simple Docker command
//     const dockerCmd = `docker run --rm --memory=256m --cpus=1.0 --network=none \
//       -v "${tempDir.replace(/\\/g, '/')}:/usr/src/app" \
//       python:3.9-slim \
//       sh /usr/src/app/execute.sh`;

//     console.log(`Executing:\n${dockerCmd}`);

//     const result = await new Promise((resolve) => {
//       let output = '';
//       const child = exec(dockerCmd, { timeout: 10000 });
      
//       child.stdout.on('data', (data) => {
//         console.log(data);
//         output += data;
//       });
      
//       child.stderr.on('data', (data) => {
//         console.error(data);
//         output += data;
//       });
      
//       child.on('close', (code) => {
//         resolve({
//           output,
//           error: code !== 0 ? `Process exited with code ${code}` : null
//         });
//       });
//     });

//     // Extract just the execution output
//     const executionOutput = result.output.includes('=== EXECUTION START ===') 
//       ? result.output.split('=== EXECUTION START ===')[1]
//            .split('=== EXECUTION END ===')[0]
//            .trim()
//       : result.output;

//     console.log(`Final output:\n${executionOutput}`);

//     await pubClient.publish(
//       roomId,
//       JSON.stringify({
//         type: "execution_result",
//         result: result.error 
//           ? `Error: ${result.error}\n${executionOutput}`
//           : executionOutput,
//         submissionId,
//         roomId,
//         timestamp: Date.now()
//       })
//     );

//   } catch (error) {
//     console.error("Execution failed:", error);
//     await pubClient.publish(
//       roomId,
//       JSON.stringify({
//         type: "execution_error",
//         error: error.message,
//         submissionId,
//         roomId,
//         timestamp: Date.now()
//       })
//     );
//   } finally {
//     try {
//       await fs.rm(tempDir, { recursive: true, force: true });
//     } catch (cleanupError) {
//       console.error("Cleanup failed:", cleanupError);
//     }
//   }
// }


//   async function main() {
//     try {
//       await client.connect();
//       await pubClient.connect();
//       console.log(`Worker ${process.pid} ready`);

//       while (true) {
//         const submission = await client.brPop("problems", 0);
//         if (submission) {
//           await processSubmission(submission.element);
//         }
//       }
//     } catch (error) {
//       console.error("Worker fatal error:", error);
//       process.exit(1);
//     }
//   }

//   main();
// }















// import { createClient } from "redis"
// import { exec } from "child_process"
// import fs from "fs/promises"
// import path from "path"
// import cluster from "cluster"

// const numCPUs = 3

// if (cluster.isPrimary) {
//   console.log(`Master ${process.pid} is running`)
//   for (let i = 0; i < numCPUs; i++) {
//     const worker = cluster.fork()
//     console.log(`Worker ${worker.process.pid} started`)
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`)
//     const newWorker = cluster.fork()
//     console.log(`Worker ${newWorker.process.pid} started`)
//   })
// } else {
//   const client = createClient({ url: "redis://127.0.0.1:6379" })
//   const pubClient = createClient({ url: "redis://127.0.0.1:6379" })

//   async function processSubmission(submission) {
//     const { code, language, roomId, submissionId, input } = JSON.parse(submission)
//     console.log(`Processing submission for room: ${roomId}, submission: ${submissionId}`)

//     const absoluteCodeDir = path.resolve(`./tmp/user-${Date.now()}`)
//     await fs.mkdir(absoluteCodeDir, { recursive: true })

//     const inputFilePath = path.join(absoluteCodeDir, "input.txt")
//     await fs.writeFile(inputFilePath, input, "utf8")

//     let codeFilePath = ""
//     let dockerCommand = ""

//     try {
//      switch (language) {
//         case "javascript":
//             codeFilePath = path.join(absoluteCodeDir, "userCode.js");
//             await fs.writeFile(codeFilePath, code);
//         dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(
//             /\\/g,
//             "/"
//           )}:/usr/src/app" node:18 sh -c "node /usr/src/app/${path.basename(
//             codeFilePath
//           )} /usr/src/app/input.txt"`;
//           break;
//     break;

//   case "python":
//     codeFilePath = path.join(absoluteCodeDir, "userCode.py");
//     await fs.writeFile(codeFilePath, code);
//     dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" python:3.9 sh -c "python /usr/src/app/${path.basename(codeFilePath)} < /usr/src/app/input.txt"`;
//     break;

//   case "cpp":
//     codeFilePath = path.join(absoluteCodeDir, "userCode.cpp");
//     await fs.writeFile(codeFilePath, code);
//     dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" gcc:11 sh -c "g++ /usr/src/app/userCode.cpp -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`;
//     break;

//   case "java":
//     codeFilePath = path.join(absoluteCodeDir, "UserCode.java");
//     await fs.writeFile(codeFilePath, code);
//     dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" openjdk:17 sh -c "javac /usr/src/app/UserCode.java && java -cp /usr/src/app UserCode < /usr/src/app/input.txt"`;
//     break;

//   case "go":
//     codeFilePath = path.join(absoluteCodeDir, "userCode.go");
//     await fs.writeFile(codeFilePath, code);
//     dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" golang:1.18 sh -c "go run /usr/src/app/userCode.go < /usr/src/app/input.txt"`;
//     break;

//   case "rust":
//     codeFilePath = path.join(absoluteCodeDir, "userCode.rs");
//     await fs.writeFile(codeFilePath, code);
//     dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" rust:latest sh -c "rustc /usr/src/app/userCode.rs -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`;
//     break;

//   default:
//     throw new Error("Unsupported language");
// }

//     } catch (err) {
//       console.error("Error preparing code files or Docker command:", err)
//       return
//     }

//     exec(dockerCommand, async (error, stdout, stderr) => {
//       let result = stdout || stderr
//       if (error) {
//         result = `Error: ${error.message}\n${stderr}`
//       }

//       console.log(`Result for room ${roomId}:\n${result}`)

//       try {
//         await pubClient.publish(roomId, result)
//       } catch (err) {
//         console.error("Failed to publish result to Redis:", err)
//       }

//       try {
//         await fs.rm(absoluteCodeDir, { recursive: true, force: true })
//       } catch (cleanupError) {
//         console.error("Failed to clean up directory:", cleanupError)
//       }
//     })
//   }

//   async function main() {
//     try {
//       await client.connect()
//       await pubClient.connect()
//       console.log("Redis Client Connected")

//       while (true) {
//         const submission = await client.brPop("problems", 0)
//         if (submission) {
//           await processSubmission(submission.element)
//         }
//       }
//     } catch (error) {
//       console.error("Failed to connect to Redis:", error)
//     }
//   }

//   main()
// }

































// import { createClient } from "redis"
// import { exec } from "child_process"
// import fs from "fs/promises"
// import path from "path"
// import cluster from "cluster"

// const numCPUs = 3

// if (cluster.isPrimary) {
//   console.log(`Master ${process.pid} is running`)

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     const worker = cluster.fork()
//     console.log(`Worker ${worker.process.pid} started`)
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`)
//     console.log("Starting a new worker")
//     const newWorker = cluster.fork()
//     console.log(`Worker ${newWorker.process.pid} started`)
//   })
// } else {
//   const client = createClient({
//     url: "redis://127.0.0.1:6379"
//   })
//   const pubClient = createClient({
//     url: "redis://127.0.0.1:6379"
//   })

//   async function processSubmission(submission) {
//     const { code, language, roomId, submissionId, input } = JSON.parse(
//       submission
//     )
//     console.log(
//       `Processing submission for room id: ${roomId}, submission id: ${submissionId}`
//     )

//     // Create unique directory for code execution
//     const absoluteCodeDir = path.resolve(`./tmp/user-${Date.now()}`)
//     await fs.mkdir(absoluteCodeDir, { recursive: true })

//     let codeFilePath = ""
//     let dockerCommand = ""
//     const inputFilePath = path.join(absoluteCodeDir, "input.txt")

//     try {
//       // Write input file
//       await fs.writeFile(inputFilePath, input, "utf8")

//       // Generate code file and Docker command based on language
//       switch (language) {
//         case "javascript":
//           codeFilePath = path.join(absoluteCodeDir, "userCode.js")
//           await fs.writeFile(codeFilePath, code)
//           dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(
//             /\\/g,
//             "/"
//           )}:/usr/src/app" node:18 sh -c "node /usr/src/app/${path.basename(
//             codeFilePath
//           )} /usr/src/app/input.txt"`
//           break

//         case "python":
//           codeFilePath = path.join(absoluteCodeDir, "userCode.py")
//           await fs.writeFile(codeFilePath, code)
//           dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(
//             /\\/g,
//             "/"
//           )}:/usr/src/app" python:3.9 sh -c "python /usr/src/app/${path.basename(
//             codeFilePath
//           )} /usr/src/app/input.txt"`
//           break

//         case "cpp":
//           codeFilePath = path.join(absoluteCodeDir, "userCode.cpp")
//           await fs.writeFile(codeFilePath, code)
//           dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 \
// -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" gcc:11  \
// sh -c "g++ /usr/src/app/userCode.cpp -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`
//           break

//         case "rust":
//           codeFilePath = path.join(absoluteCodeDir, "userCode.rs")
//           await fs.writeFile(codeFilePath, code)
//           dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" rust:latest sh -c "rustc /usr/src/app/userCode.rs -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`
//           break

//         case "java":
//           codeFilePath = path.join(absoluteCodeDir, "UserCode.java")
//           await fs.writeFile(codeFilePath, code)
//           dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" openjdk:17 sh -c "javac /usr/src/app/UserCode.java && java -cp /usr/src/app UserCode < /usr/src/app/input.txt"`
//           break

//         case "go":
//           codeFilePath = path.join(absoluteCodeDir, "userCode.go")
//           await fs.writeFile(codeFilePath, code)
//           dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" golang:1.18 sh -c "go run /usr/src/app/userCode.go < /usr/src/app/input.txt"`
//           break

//         default:
//           throw new Error("Unsupported language")
//       }
//     } catch (error) {
//       console.error("Failed to prepare code file or Docker command:", error)
//       return
//     }

//     // Execute Docker command
//     exec(dockerCommand, async (error, stdout, stderr) => {
//       let result = stdout || stderr
//       if (error) {
//         result = `Error: ${error.message}`
//       }
//       console.log(`Result for room ${roomId}: ${result}`)

//       try {
//         await pubClient.publish(roomId, result)
//       } catch (err) {
//         console.error("Failed to publish result to Redis:", err)
//       }

//       // Clean up by removing the created directory
//       try {
//         await fs.rm(absoluteCodeDir, { recursive: true, force: true })
//       } catch (cleanupError) {
//         console.error("Failed to clean up directory:", cleanupError)
//       }
//     })
//   }

//   async function main() {
//     try {
//       await client.connect()
//       await pubClient.connect()
//       console.log("Redis Client Connected")

//       while (true) {
//         const submission = await client.brPop("problems", 0)
//         console.log("Processing submission...")
//         if (submission) {
//           await processSubmission(submission.element)
//         }
//       }
//     } catch (error) {
//       console.error("Failed to connect to Redis:", error)
//     }
//   }

//   main()
// }
