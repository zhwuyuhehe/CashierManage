create table "members"
(    id          BIGINT NOT NULL ,
    tel         BIGINT PRIMARY KEY ,
    score       BIGINT DEFAULT 0 NOT NULL ,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT LOCALTIMESTAMP NOT NULL ,
    update_time TIMESTAMP WITH TIME ZONE DEFAULT LOCALTIMESTAMP NOT NULL );

create table "bill"
(    id          BIGINT PRIMARY KEY,
    member      BIGINT NOT NULL ,
    sum         DOUBLE PRECISION NOT NULL ,
    purchased   CHARACTER LARGE OBJECT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT LOCALTIMESTAMP NOT NULL ,
    state       BOOLEAN DEFAULT TRUE NOT NULL ,
    FOREIGN KEY (member) REFERENCES "members"(tel));

create table "operators"
(    tel         BIGINT PRIMARY KEY,
    pwd         CHARACTER LARGE OBJECT,
    nickname    CHARACTER LARGE OBJECT,
    privilege   BOOLEAN DEFAULT FALSE NOT NULL ,
    activation  BOOLEAN DEFAULT FALSE NOT NULL ,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT LOCALTIMESTAMP NOT NULL ,
    update_time TIMESTAMP WITH TIME ZONE DEFAULT LOCALTIMESTAMP NOT NULL);

create table "repository"
(    name        CHARACTER LARGE OBJECT,
    isn         BIGINT NOT NULL ,
    category    CHARACTER LARGE OBJECT,
    cost        DOUBLE PRECISION,
    price       DOUBLE PRECISION NOT NULL ,
    stock       BIGINT DEFAULT 0 NOT NULL ,
    promoting   DOUBLE PRECISION DEFAULT 1 NOT NULL ,
    update_time TIMESTAMP WITH TIME ZONE DEFAULT LOCALTIMESTAMP NOT NULL);
