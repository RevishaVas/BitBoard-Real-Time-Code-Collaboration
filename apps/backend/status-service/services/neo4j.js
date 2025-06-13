require("dotenv").config();
const neo4j = require("neo4j-driver");


const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  {
    encrypted: false
  }
);

const getSession = () => driver.session({ database: "neo4j" });


//  helper function
const neo4jQuery = async (query, params = {}) => {
  const session = getSession();
  try {
    const result = await session.run(query, params);
    return result;
  } catch (err) {
    console.error(" Error during Neo4j query:", err);
    throw err;
  } finally {
    await session.close();
  }
};


module.exports = { getSession, neo4jQuery, };
