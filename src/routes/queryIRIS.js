const Pool = require("pg").Pool;
require('dotenv').config();
const getPool = () => {
  const connectionString = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
      : `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.HOST}:5432/dvf`;

  return new Pool({
    connectionString,
  });
};

const pool = getPool();


const prixMedian = (request, response) => {
  const formeiris = request.body.data
  console.info(formeiris)
  pool.query(
    `
    SELECT
    anneemut,
    sum(nblocapt) as nb_vendu,
    concat('','Appartement') as Type
    FROM dvf.mutation
    where libnatmut = 'Vente'
    AND nbcomm = 1
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON($1),4326),ST_TRANSFORM(geomlocmut,4326))
    group by anneemut
UNION
SELECT
    anneemut,
    sum(nblocmai) as nb_vendu,
    concat('','Maison') as Type
    FROM dvf.mutation
    where libnatmut = 'Vente'
    AND nbcomm = 1
    AND ST_CONTAINS(ST_TRANSFORM(ST_GeomFromGeoJSON($1),4326),ST_TRANSFORM(geomlocmut,4326))
    group by anneemut
    `,
    [formeiris],
    (error, results) => {
      if (error) {
          return response.status(500).json({
              success: false,
              message: "Erreur serveur lors de la récupération des données.",
          });
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  prixMedian
};
