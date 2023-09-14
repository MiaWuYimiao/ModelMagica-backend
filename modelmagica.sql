\echo 'Delete and recreate model_magica db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE model_magica;
CREATE DATABASE model_magica;
\connect model_magica

\i modelmagica-schema.sql
\i modelmagica-seed.sql

\echo 'Delete and recreate model_magica_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE model_magica_test;
CREATE DATABASE model_magica_test;
\connect model_magica_test

\i modelmagica-schema.sql
