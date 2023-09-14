-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'joel@joelburton.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'joel@joelburton.com',
        TRUE);

INSERT INTO images (url)
VALUES ('https://i.mdel.net/i/db/2022/3/1668193/1668193-500w.jpg'),
        ('https://i.mdel.net/i/db/2023/8/2024427/2024427-500w.jpg'),
        ('https://i.mdel.net/i/db/2019/9/1203953/1203953-500w.jpg'),
        ('https://i.mdel.net/i/db/2019/6/1142407/1142407-500w.jpg'),
        ('https://i.mdel.net/i/db/2023/4/1941323/1941323-800w.jpg'),
        ('https://i.mdel.net/i/db/2023/5/1947795/1947795-800w.jpg'),
        ('https://i.mdel.net/i/db/2023/5/1947796/1947796-800w.jpg'),
        ('https://i.mdel.net/i/db/2017/11/806757/806757-500w.jpg'),
        ('https://i.mdel.net/i/db/2022/3/1661105/1661105-500w.jpg'),
        ('https://i.mdel.net/i/db/2017/2/645239/645239-500w.jpg');

INSERT INTO people (fullname,
                       profile_img,
                       role,
                       biography,
                       birthday,
                       nationalities,
                       social_media,
                       follower)
VALUES ('bella-hadid', 1, 'Model',
        'Isabella Hadid is an American supermodel of Dutch and Palestinian descent, actress, and social media influencer. Born in Los Angeles, California, she is the younger sister of supermodel Gigi Hadid. Bella began her modeling career in 2014 and quickly rose to prominence, walking in major fashion shows for designers such as Chanel, Dior, and Marc Jacobs.', 
        '1996-10-09', 'United States, Palestine', 'https://www.instagram.com/bellahadid/', 59600000),
        ('ethan-james-green', 2, 'Photographer', NULL, NULL, 'United States', 'https://www.instagram.com/ethanjamesgreen/',152300),
        ('gabriella-karefa-johnson', 3, 'Stylist', 'Global Fashion Editor-at-Large at Vogue', NULL, NULL,'https://www.instagram.com/gabriellak_j/', 376500),
        ('jawara', 4, 'Hair Stylist', 'International hairstylist Jawara is one of the most sought after names in fashion. The Contributing Beauty Editor for Dazed Beauty has a number of notable accolades under his belt, including a British Fashion Council New Wave Creatives Award as well as Business of Fashion 500 and Dazed 100 rankings.',
        NULL, NULL, 'https://www.instagram.com/jawaraW/', 67800),
        ('carlijin-jacobs', 8, 'Photographer', NULL, NULL, NULL, 'https://www.instagram.com/carlijnjacobs/', 236000),
        ('imruh-asha', 9, 'Stylist', 'Fashion Director of Dazed Magazine', NULL, NULL, 'https://www.instagram.com/imruh/', 77600),
        ('mustafa-yanaz', 10, 'Hair Stylist', NULL, NULL, NULL, 'https://www.instagram.com/mustafayanaz/', 36000);

       
INSERT INTO works (title, client, type, source, publish_time)
VALUES ('American Vogue April 2022 Cover', 'American Vogue', 'Magazine Covers', 'vogue.com', '2022-04-01'),
        ('Vogue Italia May 2023 Cover', 'Vogue Italia', 'Magazine Covers', 'vogue.it', '2023-05-01');

INSERT INTO work_image (work_id, image_id)
VALUES (1, 1), (2, 5), (2, 6), (2, 7);

INSERT INTO people_image (artist, image_id)
VALUES ('bella-hadid', 1), ('ethan-james-green', 1), ('gabriella-karefa-johnson', 1),('jawara', 1),
        ('bella-hadid', 5), ('carlijin-jacobs', 5), ('imruh-asha', 5),
        ('bella-hadid', 6), ('mustafa-yanaz', 6), ('bella-hadid', 7);

INSERT INTO favorites (username, artist)
VALUES ('testuser', 'bella-hadid');


      