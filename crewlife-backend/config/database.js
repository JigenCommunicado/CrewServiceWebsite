module.exports = {
  development: {
    url: "postgresql://username:password@localhost:5432/crewlife_db?schema=public"
  },
  production: {
    url: process.env.DATABASE_URL
  }
};
  development: {
    url: "postgresql://username:password@localhost:5432/crewlife_db?schema=public"
  },
  production: {
    url: process.env.DATABASE_URL
  }
};
