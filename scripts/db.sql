--
-- PostgreSQL database dump
--

-- Dumped from database version 13.15 (Debian 13.15-1.pgdg120+1)
-- Dumped by pg_dump version 13.15 (Debian 13.15-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'pending',
    'confirmed',
    'delivering',
    'completed',
    'cancelled'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'cod',
    'momo',
    'zalo_pay',
    'vn_pay'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: About; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."About" (
    id integer NOT NULL,
    content text NOT NULL
);


ALTER TABLE public."About" OWNER TO postgres;

--
-- Name: About_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."About_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."About_id_seq" OWNER TO postgres;

--
-- Name: About_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."About_id_seq" OWNED BY public."About".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authors (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    slug text,
    image text NOT NULL
);


ALTER TABLE public.authors OWNER TO postgres;

--
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.authors_id_seq OWNER TO postgres;

--
-- Name: authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.authors_id_seq OWNED BY public.authors.id;


--
-- Name: book_author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_author (
    book_id integer NOT NULL,
    author_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.book_author OWNER TO postgres;

--
-- Name: book_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_category (
    book_id integer NOT NULL,
    category_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.book_category OWNER TO postgres;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id integer NOT NULL,
    slug text,
    name text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    price double precision NOT NULL,
    promotion_list_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    avg_stars double precision DEFAULT 0 NOT NULL,
    sold_quantity integer DEFAULT 0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    discount_date timestamp(3) without time zone,
    final_price double precision NOT NULL,
    discount_percentage integer DEFAULT 0
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.books_id_seq OWNER TO postgres;

--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    slug text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    order_id text NOT NULL,
    book_id integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "totalPrice" double precision NOT NULL,
    price double precision NOT NULL,
    final_price double precision NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    user_id text NOT NULL,
    status public."OrderStatus" DEFAULT 'pending'::public."OrderStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    total_price double precision DEFAULT 0 NOT NULL,
    phone text NOT NULL,
    shipping_address text NOT NULL,
    payment_method public."PaymentMethod" DEFAULT 'cod'::public."PaymentMethod" NOT NULL,
    full_name text NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: promotion_lists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_lists (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    slug text,
    discount_percentage integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.promotion_lists OWNER TO postgres;

--
-- Name: promotion_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.promotion_lists_id_seq OWNER TO postgres;

--
-- Name: promotion_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_lists_id_seq OWNED BY public.promotion_lists.id;


--
-- Name: rating_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rating_reviews (
    id integer NOT NULL,
    book_id integer NOT NULL,
    star integer NOT NULL,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL
);


ALTER TABLE public.rating_reviews OWNER TO postgres;

--
-- Name: rating_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rating_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rating_reviews_id_seq OWNER TO postgres;

--
-- Name: rating_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rating_reviews_id_seq OWNED BY public.rating_reviews.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."UserRole" DEFAULT 'user'::public."UserRole" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    refresh_token text,
    address text DEFAULT ''::text NOT NULL,
    image text NOT NULL,
    phone text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: About id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."About" ALTER COLUMN id SET DEFAULT nextval('public."About_id_seq"'::regclass);


--
-- Name: authors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors ALTER COLUMN id SET DEFAULT nextval('public.authors_id_seq'::regclass);


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: promotion_lists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_lists ALTER COLUMN id SET DEFAULT nextval('public.promotion_lists_id_seq'::regclass);


--
-- Name: rating_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rating_reviews ALTER COLUMN id SET DEFAULT nextval('public.rating_reviews_id_seq'::regclass);


--
-- Data for Name: About; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."About" (id, content) FROM stdin;
1	<div>\n<div>\n<div data-brick-index="0" data-brick-type="TEXT" data-brick-label="TEXT: Giới thiệu Tiki - Header" data-brick-id="236871" data-brick-level="widget">\n<div>\n<div>\n<h1>Giới thiệu về Nash BookStore</h1>\n</div>\n</div>\n</div>\n<div data-brick-index="1" data-brick-type="TEXT" data-brick-label="TEXT: Giới thiệu Tiki - Content" data-brick-id="236872" data-brick-level="widget">\n<div>\n<div>\n<p>Nash Bookstore l&agrave; một hệ sinh th&aacute;i thương mại tất cả trong một, gồm c&aacute;c c&ocirc;ng ty th&agrave;nh vi&ecirc;n như:</p>\n<p>- C&ocirc;ng ty TNHH&nbsp;Nash Bookstore&nbsp;("Nash Bookstore") l&agrave; đơn vị thiết lập, tổ chức s&agrave;n thương mại điện tử&nbsp;<a href="http://localhost:4200" aria-invalid="true">nashbookstore.vn</a> để c&aacute;c Nh&agrave; b&aacute;n h&agrave;ng thể tiến h&agrave;nh một phần hoặc to&agrave;n bộ quy tr&igrave;nh mua b&aacute;n h&agrave;ng h&oacute;a, dịch vụ tr&ecirc;n s&agrave;n thương mại điện tử.&nbsp;</p>\n<p>- C&ocirc;ng ty TNHH Nash BookstoreNOW Smart Logistics ("TNSL") l&agrave; đơn vị cung cấp c&aacute;c dịch vụ logistics đầu-cuối, dịch vụ vận chuyển, dịch vụ bưu ch&iacute;nh cho S&agrave;n thương mại điện tử <a href="http://localhost:4200" aria-invalid="true">nashbookstore.vn</a></p>\n<p>-&nbsp;C&ocirc;ng ty TNHH MTV Thương mại Ti Ki ("Nash Bookstore Trading") l&agrave; đơn vị b&aacute;n h&agrave;ng h&oacute;a, dịch vụ tr&ecirc;n s&agrave;n thương mại điện tử</p>\n<p>-&nbsp;Đơn vị b&aacute;n lẻ Nash Bookstore Trading v&agrave; S&agrave;n Giao dịch cung cấp 10 triệu sản phẩm từ 26 ng&agrave;nh h&agrave;ng phục vụ h&agrave;ng triệu kh&aacute;ch h&agrave;ng tr&ecirc;n to&agrave;n quốc. Với phương ch&acirc;m hoạt động &ldquo;Tất cả v&igrave; Kh&aacute;ch H&agrave;ng&rdquo;, Nash Bookstore lu&ocirc;n kh&ocirc;ng ngừng nỗ lực n&acirc;ng cao chất lượng dịch vụ v&agrave; sản phẩm, từ đ&oacute; mang đến trải nghiệm mua sắm trọn vẹn cho Kh&aacute;ch H&agrave;ng Việt Nam với dịch vụ giao h&agrave;ng nhanh trong 2 tiếng v&agrave; ng&agrave;y h&ocirc;m sau Nash BookstoreNOW lần đầu ti&ecirc;n tại Đ&ocirc;ng Nam &Aacute;, c&ugrave;ng cam kết cung cấp h&agrave;ng ch&iacute;nh h&atilde;ng với ch&iacute;nh s&aacute;ch ho&agrave;n tiền 111% nếu ph&aacute;t hiện h&agrave;ng giả, h&agrave;ng nh&aacute;i. Th&agrave;nh lập từ th&aacute;ng 3/2010, Nash Bookstore&nbsp;hiện đang l&agrave; trang thương mại điện tử lọt top 2 tại Việt Nam v&agrave; top 6 tại khu vực Đ&ocirc;ng Nam &Aacute;. Nash Bookstore lọt Top 1 nơi l&agrave;m việc tốt nhất Việt Nam trong ng&agrave;nh Internet/E-commerce 2018 (Anphabe b&igrave;nh chọn), Top 50 nơi l&agrave;m việc tốt nhất ch&acirc;u &Aacute; 2019 (HR Asia b&igrave;nh chọn).</p>\n</div>\n</div>\n</div>\n<div data-brick-index="2" data-brick-type="TEXT" data-brick-label="TEXT: Th&ocirc;ng tin c&ocirc;ng ty - Header" data-brick-id="236873" data-brick-level="widget">\n<div>\n<div>\n<h1>Th&ocirc;ng tin về c&ocirc;ng ty</h1>\n</div>\n</div>\n</div>\n<div data-brick-index="3" data-brick-type="TEXT" data-brick-label="TEXT: Th&ocirc;ng tin c&ocirc;ng ty - Content" data-brick-id="236874" data-brick-level="widget">\n<div>\n<div>\n<p>- C&ocirc;ng ty TNHH Nash Bookstore</p>\n<p>- Địa chỉ đăng k&yacute; kinh doanh: T&ograve;a Nh&agrave; Viettel, Số 285, Đường C&aacute;ch Mạng Th&aacute;ng 8 - Phường 12 - Quận 10 - TP Hồ Ch&iacute; Minh - Việt Nam.</p>\n<p>- Giấy chứng nhận Đăng k&yacute; Kinh doanh số 0309532909 do Sở Kế hoạch v&agrave; Đầu tư Th&agrave;nh phố Hồ Ch&iacute; Minh cấp ng&agrave;y 06/01/2010 Qu&yacute; kh&aacute;ch c&oacute; nhu cầu li&ecirc;n lạc, trao đổi hoặc đ&oacute;ng g&oacute;p &yacute; kiến, vui l&ograve;ng tham khảo c&aacute;c th&ocirc;ng tin sau:</p>\n<p>- Li&ecirc;n lạc qua điện thoại: 1900 6035</p>\n<p>- Li&ecirc;n lạc qua email: Truy cập hotro.Nash Bookstore.vn</p>\n<p>-&nbsp;Fanpage của Nash Bookstore: <a href="http://facebook.com/nashbookstore">http://facebook.com/nashbookstore</a></p>\n<p>-&nbsp;Đối t&aacute;c c&oacute; nhu cầu hợp t&aacute;c quảng c&aacute;o hoặc kinh doanh: marketing@Nash Bookstore.vn</p>\n<p>-&nbsp;Văn ph&ograve;ng ch&iacute;nh: T&ograve;a nh&agrave; Viettel, 285 C&aacute;ch Mạng Th&aacute;ng 8, Phường 12, Quận 10, Th&agrave;nh phố Hồ Ch&iacute; Minh.</p>\n<p>- Văn ph&ograve;ng: 52 &Uacute;t Tịch, Phường 4, Quận T&acirc;n B&igrave;nh, Th&agrave;nh Phố Hồ Ch&iacute; Minh.</p>\n</div>\n</div>\n</div>\n</div>\n</div>
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2ee08ba3-5a40-46f0-adf2-d13cc2ab2a82	6014d6747b0b88c787e7d48554a119c0a7a2d6c8b03ec88aa5daaa6f84260d5d	2024-05-24 16:37:44.081771+00	20240516063205_	\N	\N	2024-05-24 16:37:44.057375+00	1
f7a0f4a1-4493-4db1-9e9c-9ea198d398f3	d8c4921f2b05659c234f476232bd364eee00dc78b49d30083bac65a1f4e054c9	2024-05-24 16:37:44.084174+00	20240516082436_authentication	\N	\N	2024-05-24 16:37:44.082533+00	1
32dc061a-5f28-4249-a266-261cdba463b5	d350dea6a3f30f3e3c9e3fa27a6f9d747f371596bfc8b01199fc4300b3a109d6	2024-05-24 16:37:44.087631+00	20240517025412_update_relations	\N	\N	2024-05-24 16:37:44.084848+00	1
dfdd8e49-906a-4d0c-ac37-fa97c16cb9e7	e9a7e914cd8e1f54f2272fdaaa5b34dd9a173aed9cc4384d617d479f48b3e40f	2024-05-24 16:37:44.090014+00	20240517031513_remove_available_quantity	\N	\N	2024-05-24 16:37:44.088334+00	1
addf69a8-e374-4d44-a077-3b26185773f4	58a0cb71a629251c5fd73f1b9533ea5fa4ed6d93734b2ec08f53e80fe1526909	2024-05-24 16:37:44.093711+00	20240520062132_add_slug	\N	\N	2024-05-24 16:37:44.090635+00	1
cd7b7668-1537-463d-974b-7f58b071ad21	d15209231efbc8a01c888f7e5da3936c015760e3c06e5aa3ca6d0ca694477b2a	2024-05-24 16:37:44.096692+00	20240520104734_add_slug_promotion_list	\N	\N	2024-05-24 16:37:44.09436+00	1
9e93156e-5837-4deb-adf0-8bcd3cc95ea2	95b56f2407d5f7dcf301c0514cb0f87aab14c55443dd5f26c23e7c6365f90768	2024-05-24 16:37:44.101497+00	20240521042941_change_discount_percentage_type	\N	\N	2024-05-24 16:37:44.097337+00	1
ed3cd042-1dec-4452-91ee-79fcb9539a16	5728823c7d0b81bb561e4a7d13523ea0d3c226da7e18606e563714cebfef4dc8	2024-05-24 16:37:44.10455+00	20240521071313_add_user_in_rating_review	\N	\N	2024-05-24 16:37:44.102196+00	1
a82de948-efee-4408-ad78-074ebfad7ad2	00f62e1d7f084220939e2762ef92b92cbf0abadca1e330378e691f067f5f8c67	2024-05-24 16:37:44.108512+00	20240521082441_rename_fields	\N	\N	2024-05-24 16:37:44.105374+00	1
f8317ae7-354a-4fd7-9cb1-4840909992fe	647cdf8df32c38124c18c2651c35fee0f7df0757b40182934aacb10c016ccee6	2024-05-24 16:37:44.113797+00	20240524162833_add_title_rating_review	\N	\N	2024-05-24 16:37:44.109995+00	1
\.


--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authors (id, name, created_at, updated_at, slug, image) FROM stdin;
7	Paulo Coelho	2024-05-27 07:47:34.626	2024-05-27 07:47:34.626	paulo-coelho	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/author%2F1716796052776-author1.jpeg?alt=media
17	Gakken	2024-06-04 09:57:08.635	2024-06-04 09:57:08.635	gakken	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media
9	Thomas Harris	2024-05-27 08:25:52.638	2024-06-05 17:14:13.257	thomas-harris	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/author%2F1717607646874-author2.jpeg?alt=media
8	Đặng Hoàng Giang	2024-05-27 08:24:04.91	2024-05-27 08:24:04.91	dang-hoang-giang	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media
3	Minh Niệm	2024-05-27 02:50:46.589	2024-06-05 17:16:29.162	minh-niem	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/author%2F1717607788315-author3.jpeg?alt=media
1	Nguyễn Nhật Ánh	2024-05-24 16:48:13.261	2024-06-05 17:17:16.304	nguyen-nhat-anh	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/author%2F1717607835447-author4.jpeg?alt=media
2	Gosho Aoyama	2024-05-24 17:22:45.018	2024-06-05 17:17:53.544	gosho-aoyama	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/author%2F1717607872779-author5.jpeg?alt=media
\.


--
-- Data for Name: book_author; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_author (book_id, author_id, created_at, updated_at) FROM stdin;
3	3	2024-05-28 08:51:04.75	2024-05-28 08:51:04.75
2	2	2024-05-28 08:51:11.008	2024-05-28 08:51:11.008
1	1	2024-05-28 10:34:26.417	2024-05-28 10:34:26.417
10	1	2024-05-30 17:16:11.659	2024-05-30 17:16:11.659
19	9	2024-06-04 09:44:50.178	2024-06-04 09:44:50.178
20	8	2024-06-04 09:51:10.076	2024-06-04 09:51:10.076
21	7	2024-06-04 09:53:35.128	2024-06-04 09:53:35.128
22	17	2024-06-04 09:58:15.607	2024-06-04 09:58:15.607
23	2	2024-06-04 10:08:58.734	2024-06-04 10:08:58.734
\.


--
-- Data for Name: book_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_category (book_id, category_id, created_at, updated_at) FROM stdin;
3	3	2024-05-28 08:50:39.701	2024-05-28 08:50:39.701
2	2	2024-05-28 08:50:46.254	2024-05-28 08:50:46.254
1	5	2024-05-28 10:21:51.744	2024-05-28 10:21:51.744
10	5	2024-05-30 10:50:55.75	2024-05-30 10:50:55.75
19	10	2024-06-04 09:44:50.178	2024-06-04 09:44:50.178
20	5	2024-06-04 09:50:28.263	2024-06-04 09:50:28.263
21	5	2024-06-04 09:53:35.128	2024-06-04 09:53:35.128
19	4	2024-06-04 09:54:04.59	2024-06-04 09:54:04.59
22	1	2024-06-04 09:58:15.607	2024-06-04 09:58:15.607
23	2	2024-06-04 10:08:58.734	2024-06-04 10:08:58.734
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, slug, name, description, image, price, promotion_list_id, created_at, updated_at, avg_stars, sold_quantity, total_reviews, discount_date, final_price, discount_percentage) FROM stdin;
10	mat-biec-(tai-ban-2022)_10	Mắt Biếc (Tái Bản 2022)	Một tác phẩm được nhiều người bình chọn là hay nhất của nhà văn này.\r\n\r\nMột tác phẩm đang được dịch và giới thiệu tại Nhật Bản (theo thông tin từ các báo)…\r\n\r\nBởi sự trong sáng của một tình cảm, bởi cái kết thúc rất, rất buồn khi suốt câu chuyện vẫn là những điều vui, buồn lẫn lộn (cái kết thúc không như mong đợi của mọi người).\r\n\r\nCũng bởi, mắt biếc… năm xưa nay đâu (theo lời một bài hát)	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/book%2F1716806345706-book1.jpeg?alt=media	37.41	\N	2024-05-27 10:39:06.441	2024-06-05 10:44:36.375	0	0	0	\N	37.41	0
3	sach-hieu-ve-trai-tim-(tai-ban-2019)_3	Sách Hiểu Về Trái Tim (Tái Bản 2019)	Là tác phẩm đầu tay của nhà sư Minh Niệm, người sáng lập dòng thiền hiểu biết (Understanding Meditation), kết hợp giữa tư tưởng Phật giáo Đại thừa và Thiền nguyên thủy Vipassana, nhưng Hiểu Về Trái Tim không phải tác phẩm thuyết giáo về Phật pháp. Cuốn sách rất “đời” với những ưu tư của một người tu nhìn về cõi thế. Ở đó, có hạnh phúc, có đau khổ, có tình yêu, có cô đơn, có tuyệt vọng, có lười biếng, có yếu đuối, có buông xả… Nhưng, tất cả những hỉ nộ ái ố ấy đều được khoác lên tấm áo mới, một tấm áo tinh khiết và xuyên suốt, khiến người đọc khi nhìn vào, đều thấy mọi sự như nhẹ nhàng hơn…	https://salt.tikicdn.com/cache/750x750/media/catalog/producttmp/1b/d0/54/3f23c30055381c7e58af80a62ce28fa5.jpg.webp	130	\N	2024-05-27 02:52:40.594	2024-05-30 15:10:01.313	0	0	0	\N	130	0
2	tham-tu-lung-danh-conan-tap-15_2	Thám Tử Lừng Danh Conan - Tập 15	Nữ thám tữ học sinh trung học Masumi SERA là người luôn có những hành động đầy ẩn ý. Mục đích thật sự của cô sẽ phần nào được hé lộ trong vụ án người phụ nữ màu đỏ, với một cái kết đầy bất ngờ. Trong vụ án liên quan đến tác giả tiểu thuyết ngôn tình xảy ra ở khách sạn nơi Sera đang sống. Conan phát hiện một cô gái bí ẩn. Ngoài ra, cậu cũng hợp tác với Heiji phá một vụ giao dịch ma túy, và Shinichi sẽ xuất hiện vô cùng hoành tráng trong vụ án thủy cung đấy!	https://salt.tikicdn.com/cache/750x750/ts/product/fe/bc/ee/9f50440f8febb594607864b510c5c6ee.jpg.webp	24.2	\N	2024-05-24 17:24:16.592	2024-06-05 15:39:35.4	4	0	1	\N	24.2	0
19	su-im-lang-cua-bay-cuu_19	Sự im lặng của bầy cừu	Những cuộc phỏng vấn ở xà lim với kẻ ăn thịt người ham thích trò đùa trí tuệ, những tiết lộ nửa chừng hắn chỉ dành cho kẻ nào thông minh, những cái nhìn xuyên thấu thân phận và suy tư của cô mà đôi khi cô muốn lảng trá Clarice Starling đã dấn thân vào cuộc điều tra án giết người lột da hàng loạt như thế, để rồi trong tiếng bức bối của chiếc đồng hồ đếm ngược về cái chết, cô phải vật lộn để chấm dứt tiếng kêu bao lâu nay vẫn đeo đẳng giấc mơ mình: tiếng kêu của bầy cừu sắp bị đem đi giết thịt.\r\n\r\nSự im lặng của bầy cừu hội tụ đầy đủ những yếu tố làm nên một cuốn tiểu thuyết trinh thám kinh dị xuất sắc nhất: không một dấu vết lúng túng trong những chi tiết thuộc lĩnh vực chuyên môn, với các tình tiết giật gân, cái chết luôn lơ lửng, với cuộc so găng của những bộ óc lớn mà không có chỗ cho kẻ ngu ngốc để cuộc chơi trí tuệ trở nên dễ dàng. Bồi đắp vào cốt truyện lôi cuốn đó là cơ hội được trải nghiệm trong trí não của cả kẻ gây tội lẫn kẻ thi hành công lý, khi mỗi bên phải vật vã trong ngục tù của đau đớn để tìm kiếm, khẩn thiết và liên tục, một sự lắng dịu cho tâm hồn.	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/book%2F1717494289375-book2.jpg?alt=media	92	\N	2024-06-04 09:44:50.178	2024-06-04 16:11:29.607	0	0	0	\N	92	0
1	lam-ban-voi-bau-troi_1	Làm Bạn Với Bầu Trời Làm Bạn Với Bầu Trời	Một câu chuyện giản dị, chứa đầy bất ngờ cho tới trang cuối cùng. Vẻ đẹp lộng lẫy, vì lòng vị tha và tình yêu thương, khiến mắt rưng rưng vì một nỗi mừng vui hân hoan. Cuốn sách như một đốm lửa thắp lên lòng khát khao sống tốt trên đời. Viết về điều tốt đã không dễ, viết sao cho người đọc có thể đón nhận đầy cảm xúc tích cực, và muốn được hưởng, được làm những điều tốt dù nhỏ bé mới thật là khó. Làm bạn với bầu trời của Nguyễn Nhật Ánh đã làm được điều này.	https://salt.tikicdn.com/cache/750x750/ts/product/af/a1/4b/92477ec9b6688060b2b5d2022a60d3e6.jpg.webp	99.5	\N	2024-05-24 16:52:58.474	2024-06-04 16:17:07.886	0	2	0	\N	99.5	0
23	tham-tu-lung-danh-conan-tap-80_23	Thám Tử Lừng Danh Conan Tập 80	Nữ thám tữ học sinh trung học Masumi SERA là người luôn có những hành động đầy ẩn ý. Mục đích thật sự của cô sẽ phần nào được hé lộ trong vụ án người phụ nữ màu đỏ, với một cái kết đầy bất ngờ. Trong vụ án liên quan đến tác giả tiểu thuyết ngôn tình xảy ra ở khách sạn nơi Sera đang sống. Conan phát hiện một cô gái bí ẩn. Ngoài ra, cậu cũng hợp tác với Heiji phá một vụ giao dịch ma túy, và Shinichi sẽ xuất hiện vô cùng hoành tráng trong vụ án thủy cung đấy!	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/book%2F1717495737851-book6.jpg?alt=media	20.1	\N	2024-06-04 10:08:58.734	2024-06-05 15:38:43.713	5	3	1	\N	20.1	0
22	sach-thieu-nhi-cho-tre-2-3-tuoi_toan-hoc_so-tu-duy-(2~3-tuoi)_22	SÁCH THIẾU NHI CHO TRẺ 2-3 TUỔI_TOÁN HỌC_Số - Tư duy (2~3 tuổi)	SỐ - TƯ DUY (2~3 tuổi)\r\n\r\nTủ sách thiếu nhi Nhật Bản dành cho các bé 2 tuổi, bé 3 tuổi \r\n\r\nGiúp trẻ thích thú khi học toán, phát triển cân bằng tri thức và tư duy\r\n\r\n☆ Quyển sách này có nội dung tổng hợp 2 lĩnh vực là số và tư duy. Các bài tập trong sách kết hợp đa dạng về gọi tên các vật quen thuộc, so sánh các số đếm đến 3, tô màu, thủ công… được phân bổ đều trong sách cho trẻ luyện tập. Cuốn sách làm cho các bài học đếm số trở nên thú vị hơn đối với trẻ thông qua những bài tập có sử dụng nhãn dán hay giải câu đố.\r\n\r\n\r\n☆ Đây được xem là một trong những cuốn sách toán hay dạy số học dành cho trẻ nhỏ để nhận biết và đếm các chữ số. Qua đó, khích thích trẻ phát triển khả năng quan sát, phân biệt, phân tích hình ảnh và khả năng tư duy logic.\r\n\r\n☆ ☆ ☆ Các bài tập chính trong sách:\r\n\r\n+ Số: đếm số và dán nhãn các số đến 3/ so sánh các số\r\n\r\n+ Tư duy: chơi dán nhãn/ tìm hình vẽ/ mê cung/ thủ công\r\n\r\n================================\r\n\r\n{Bộ sách giáo dục Nhật Bản dành cho lứa tuổi nhi đồng} có 3 đặc điểm:\r\n\r\n- Dễ dàng lựa chọn theo độ tuổi\r\n\r\n- Xây dựng bài tập thúc đẩy trẻ học hỏi\r\n\r\n- Bài tập nâng cao khả năng tư duy\r\n\r\n=> Giúp trẻ cảm thấy "Học tập là một niềm vui".\r\n\r\n- Khổ giấy A4, màu sắc phong phú, dễ thương. Có thể tách rời từng trang và dễ dàng sử dụng.\r\n\r\n- Có đính kèm “Nhãn dán” ở đầu trang sách. (Khi trẻ hoàn thành bài tập, hãy khen “Con làm tốt lắm” và dán "Nhãn cổ vũ", tạo hứng thú và động lực cho trẻ cố gắng.)\r\n\r\n- Phần "Hướng dẫn" ở góc trên bên phải, giải thích các điểm cần lưu ý cho trẻ.\r\n\r\n- Cuối quyển sách đính kèm với "Bảng luyện tập" có thể viết và xóa được nhiều lần.\r\n\r\n- Chất liệu: Sách được in trên chất liệu giấy tốt, độ sáng của giấy được chọn lọc để bảo vệ thị lực cho các bé nhỏ.\r\n\r\n********************************\r\nTác giả:Gakken\r\n\r\nDịch giả: Nhóm U.I.H.\r\n\r\nSố trang: 60 trang\r\n\r\nKhổ: 21x29,5cm\r\n\r\nMã số sách quốc tế - ISBN: 978-604-68-5592-7\r\n\r\n☆ Cuốn sách do Công ty TNHH U International Human phối hợp cùng Nhà xuất bản Văn hóa - Văn nghệ cùng thực hiện. Công ty TNHH U International Human phối hợp cùng Nhà xuất bản Văn hóa - Văn nghệ xin giới thiệu "Bộ sách dành cho lứa tuổi nhi đồng" bao gồm 35 quyển được mua bản quyền từ tập đoàn Gakken. Gakken là tập đoàn hàng đầu tại Nhật Bản chuyên về lĩnh vực xuất bản giáo dục. Đây là bộ sách hoàn hảo dành riêng cho lứa tuổi mầm non, giúp trẻ có thể phát triển trí não toàn diện. Thông qua bộ sách, trẻ được giáo dục để hình thành những kỹ năng và thói quen học tập tốt từ giai đoạn sớm. Với phương châm "Học tập là một niềm vui", chúng tôi tin rằng với sự tương tác cùng con 10 phút mỗi ngày, bố mẹ không chỉ giúp con phát triển trí tuệ mà còn mang đến giá trị tinh thần to lớn. Điều này giúp trẻ xây dựng nền tảng học thức, nâng cao khả năng sáng tạo và bồi đắp thêm tình cảm gia đình.	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/book%2F1717495095127-book5.jpg?alt=media	185	\N	2024-06-04 09:58:15.607	2024-06-04 16:17:07.886	0	1	0	\N	185	0
21	nha-gia-kim-(tai-ban-2020)_21	Nhà Giả Kim (Tái Bản 2020)	Tất cả những trải nghiệm trong chuyến phiêu du theo đuổi vận mệnh của mình đã giúp Santiago thấu hiểu được ý nghĩa sâu xa nhất của hạnh phúc, hòa hợp với vũ trụ và con người.\r\n\r\nTiểu thuyết Nhà giả kim của Paulo Coelho như một câu chuyện cổ tích giản dị, nhân ái, giàu chất thơ, thấm đẫm những minh triết huyền bí của phương Đông. Trong lần xuất bản đầu tiên tại Brazil vào năm 1988, sách chỉ bán được 900 bản. Nhưng, với số phận đặc biệt của cuốn sách dành cho toàn nhân loại, vượt ra ngoài biên giới quốc gia, Nhà giả kim đã làm rung động hàng triệu tâm hồn, trở thành một trong những cuốn sách bán chạy nhất mọi thời đại, và có thể làm thay đổi cuộc đời người đọc.\r\n\r\n“Nhưng nhà luyện kim đan không quan tâm mấy đến những điều ấy. Ông đã từng thấy nhiều người đến rồi đi, trong khi ốc đảo và sa mạc vẫn là ốc đảo và sa mạc. Ông đã thấy vua chúa và kẻ ăn xin đi qua biển cát này, cái biển cát thường xuyên thay hình đổi dạng vì gió thổi nhưng vẫn mãi mãi là biển cát mà ông đã biết từ thuở nhỏ. Tuy vậy, tự đáy lòng mình, ông không thể không cảm thấy vui trước hạnh phúc của mỗi người lữ khách, sau bao ngày chỉ có cát vàng với trời xanh nay được thấy chà là xanh tươi hiện ra trước mắt. ‘Có thể Thượng đế tạo ra sa mạc chỉ để cho con người biết quý trọng cây chà là,’ ông nghĩ.”	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/book%2F1717494814413-book4.jpg?alt=media	55.4	\N	2024-06-04 09:53:35.128	2024-06-05 10:44:36.375	0	2	0	\N	55.4	0
20	dai-duong-den-nhung-cau-chuyen-tu-the-gioi-cua-tram-cam_20	Đại Dương Đen - Những Câu Chuyện Từ Thế Giới Của Trầm Cảm	“Tôi sợ những cơn của mình, chúng xâm chiếm não bộ tôi, nhấn chìm lý trí của tôi, chúng phơi bày sự đau đớn, cô đơn, nỗi sầu thảm suốt những năm tháng niên thiếu của tôi, sự ám ảnh của bạo lực, của lẻ loi, của tức giận vì chẳng được ai giúp đỡ. Trong những giấc mơ, tôi thét lên với mọi người, cố gắng diễn đạt sự sợ hãi và tuyệt vọng của mình, nhưng không ai hiểu.”\r\n\r\nĐại dương đen là hành trình nhẫn nại của tác giả Đặng Hoàng Giang cùng người trầm cảm, kể cho chúng ta câu chuyện vừa dữ dội vừa tê tái về những số phận, mà vì định kiến và sự thiếu hiểu biết của chính gia đình và xã hội, đã bị tước đi quyền được sống với nhân phẩm, được cống hiến, được yêu thương và hạnh phúc.\r\n\r\nLà tiếng nói chia sẻ hiếm hoi với thế giới của người trầm cảm, là lời kêu gọi xóa bỏ định kiến xã hội, Đại dương đen đồng thời là công trình giáo dục tâm lý, cung cấp kiến thức căn bản về trầm cảm, hình hài nó thế nào, nó từ đâu tới, nó có thể phá hủy ra sao, có những phương thức trị liệu nào, và mỗi chúng ta có thể làm gì để những người không may mắn được sống an hòa với nhân phẩm của mình.\r\n\r\nTÁC GIẢ:\r\n\r\nTiến sĩ Đặng Hoàng Giang là chuyên gia phát triển, nhà hoạt động xã hội và tác giả chính luận. Các hoạt động nghiên cứu và vận động chính sách của anh nhằm nâng cao chất lượng quản trị quốc gia và thúc đẩy tiếng nói của người dân. Anh nỗ lực mở rộng không gian xã hội dân sự, truyền bá tri thức, phá bỏ định kiến và kỳ thị, góp phần xây dựng một xã hội khoan dung và trắc ẩn.\r\n\r\nĐặng Hoàng Giang tốt nghiệp kỹ sư tin học tại Đại học Công nghệ Ilmenau, Đức, và có bằng tiến sĩ kinh tế phát triển của Đại học Công nghệ Vienna, Áo. Những cuốn sách và bài viết của anh có sức ảnh hưởng rộng rãi trong xã hội.	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/book%2F1717494457937-book3.jpg?alt=media	144	\N	2024-06-04 09:47:38.426	2024-06-05 10:44:36.375	0	1	0	\N	144	0
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, created_at, updated_at, slug) FROM stdin;
1	Sách thiếu nhi	2024-05-24 16:48:25.701	2024-05-24 16:48:25.701	sach-thieu-nhi
2	Truyện tranh	2024-05-24 17:23:18.256	2024-05-24 17:23:18.256	truyen-tranh
3	Kỹ năng sống	2024-05-27 02:50:28.612	2024-05-27 02:50:28.612	ky-nang-song
4	Kinh dị	2024-05-27 08:41:26.512	2024-05-27 08:41:26.512	kinh-di
5	Văn học	2024-05-27 09:54:38.98	2024-05-27 09:54:38.98	van-hoc
10	Trinh thám	2024-06-04 09:43:58.302	2024-06-04 09:43:58.302	trinh-tham
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_id, book_id, quantity, created_at, updated_at, "totalPrice", price, final_price) FROM stdin;
e164c9b2-80b8-48ba-927a-3037529c9281	1	2	2024-06-05 15:48:37.873	2024-06-05 15:48:37.873	199	99.5	99.5
e164c9b2-80b8-48ba-927a-3037529c9281	21	1	2024-06-05 15:48:37.873	2024-06-05 15:48:37.873	55.4	55.4	55.4
e164c9b2-80b8-48ba-927a-3037529c9281	23	3	2024-06-05 15:48:37.873	2024-06-05 15:48:37.873	60.3	20.1	20.1
4d2efabf-c77c-4bd4-9bbd-66da8934cf20	20	1	2024-06-05 15:53:16.933	2024-06-05 15:53:16.933	144	144	144
4d2efabf-c77c-4bd4-9bbd-66da8934cf20	21	1	2024-06-05 15:53:16.933	2024-06-05 15:53:16.933	55.4	55.4	55.4
4d2efabf-c77c-4bd4-9bbd-66da8934cf20	22	1	2024-06-05 15:53:16.933	2024-06-05 15:53:16.933	185	185	185
747f78c6-72e0-4207-bf79-990db8485049	22	1	2024-06-06 02:40:25.308	2024-06-06 02:40:25.308	185	185	185
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, status, created_at, updated_at, total_price, phone, shipping_address, payment_method, full_name) FROM stdin;
e164c9b2-80b8-48ba-927a-3037529c9281	54771e66-c7a3-436f-86a1-cf22ddd12a69	delivering	2024-06-05 15:48:37.873	2024-06-05 15:53:47.206	314.7	0344043493	221/3E Phan Van Khoe	momo	Tri Do
4d2efabf-c77c-4bd4-9bbd-66da8934cf20	54771e66-c7a3-436f-86a1-cf22ddd12a69	completed	2024-06-05 15:53:16.933	2024-06-05 15:54:15.568	384.4	0344043493	221/3E Phan Van Khoe	vn_pay	Tri Do
747f78c6-72e0-4207-bf79-990db8485049	54771e66-c7a3-436f-86a1-cf22ddd12a69	pending	2024-06-06 02:40:25.308	2024-06-06 02:40:25.308	185	0344043493	221/3E Phan Van Khoe	cod	Tri Do
\.


--
-- Data for Name: promotion_lists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_lists (id, name, created_at, updated_at, slug, discount_percentage) FROM stdin;
1	On sale	2024-05-26 06:48:39.913	2024-05-26 06:48:39.913	on-sale	30
2	Flash sale	2024-05-26 14:17:34.199	2024-05-26 14:17:34.199	flash-sale	50
\.


--
-- Data for Name: rating_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rating_reviews (id, book_id, star, content, created_at, updated_at, user_id, title) FROM stdin;
14	23	5	Sách đẹp, không bị nhăn hoặc rách và giao hàng rất nhanh.	2024-06-05 15:38:43.713	2024-06-05 15:38:43.713	54771e66-c7a3-436f-86a1-cf22ddd12a69	Rất hài lòng
15	2	4	Truyện rất hay, tuy nhiên giao hàng hơi lâu xíu.	2024-06-05 15:39:35.4	2024-06-05 15:39:35.4	54771e66-c7a3-436f-86a1-cf22ddd12a69	Tạm ổn
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, role, created_at, updated_at, refresh_token, address, image, phone) FROM stdin;
9fce8d33-4234-44bb-8d2c-20e3c25710c2	tri9@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$SGXOecWA/P4/uLmq/Hvbmw$TCEqw4ms9iwAOWWbI2inHZvRB1FPIL8BAk6yuhdsccU	Tri Do	user	2024-05-24 17:45:34.039	2024-05-24 17:45:34.098	$argon2id$v=19$m=65536,t=3,p=4$hA6/cc4HVKuHy/Oq+gjsNg$CxGulazeF1mdW9EYC7Dy9VqX8UyJod+l62rqp/cZ3fc		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
9b1e47d3-0adb-4264-880d-2b702d1abb36	tri7@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$ZXRKAIMImej3AhK5Xq77gA$GboRLUUgJByMcMrYwfeiXCplPRvVcq3ugthMbFRmiSs	Tri Do	user	2024-05-24 17:45:26.364	2024-05-24 17:45:26.42	$argon2id$v=19$m=65536,t=3,p=4$Zkoot3fUkrYGpFNUkPVGwg$gAZ+o4zSggmvUr73qloGfDoQTdo7KcWm0S8XALTpAlM		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
8d25e1f0-0568-423b-b921-fec1abd19acd	tri6@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$A2R9xT5BWH7cha11EZ+/1A$5b6GhReNLp5RniC4IMgRhmKrjAXXMYOxLaoJmbC0hYo	Tri Do	user	2024-05-24 17:45:23.094	2024-05-24 17:45:23.158	$argon2id$v=19$m=65536,t=3,p=4$jJmFEaONwjppIUvaWQV4vg$TrO6lUZnuMVOJG9mS8s1FoQgx2sltw7x+YObkxRRHAw		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
fbbbac44-c640-4b6a-93fe-713391c5fd7f	tri4@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$ZFD4Eusjr1RUm1swaoJx+A$wbDBHFogGCB348qqVJHSBoysfLsHmuXUIUB5JUq9p1w	Tri Do	user	2024-05-24 17:45:16.911	2024-05-24 17:45:16.973	$argon2id$v=19$m=65536,t=3,p=4$+Tgj2soWATIdg+5rJIWGFg$Asash3NJMgPmr8HHTxANmMHe3zhyueOuyUZW9fzcNMI		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
8a984c68-f2f6-45c8-818e-2ec705505b97	tri5@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$5bEBu8Wc8yNK5lkouUN9ng$AV5RFf9GlTKzmm35k5HYx8tmRcLjA4l1uA/wDREsTUI	Tri Do	user	2024-05-24 17:45:19.697	2024-05-24 17:45:19.76	$argon2id$v=19$m=65536,t=3,p=4$q2jhsYnDUaneqC2mupp/Cw$g9d4PEDLH3GAb4ceRddm0nFcuT2baBTcby4kHnr01zs		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
ce4140d5-c50c-4eb0-bcbf-8a4317c0906d	tri8@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$RI2kfAkyyDGFzNkwKK+5wA$ssUYHgxjM5AhJ847URc6HA3wrZPGFyZH4rZ+z0Y8afg	Tri Do	user	2024-05-24 17:45:29.959	2024-05-24 17:45:30.018	$argon2id$v=19$m=65536,t=3,p=4$bv2k0oQIr+/xNs/pXDTbaQ$LNgvUetEMtIEOFUxA3crr+1DDPi+3Kk2kc/ghLBqqB0		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
54771e66-c7a3-436f-86a1-cf22ddd12a69	tri1@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$Zzn85xKQjfQ4oSiamJUCoA$6EjfHuh4CBh2s3HiDxQnNoVSfuMFXtGldrIyIMpgtwI	Tri Do	user	2024-05-24 16:53:21.686	2024-06-05 15:47:34.861	$argon2id$v=19$m=65536,t=3,p=4$/xlPfNxOi4ynKfCJFvFHug$X+hQB+RcgHo/rQQc83Mz39KeiU2nqYaptkIwluQ6a+k	221/3E Phan Van Khoe	https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	0344043493
4afbd206-3ce8-4635-bb8c-b0e8c7db18d3	tri3@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$8jx6/6jTGoCYe2myPe8Vqg$1KAVWcptTy0ie8gZ2hGndnMQMf9GYkHXygujGHzX5fE	Tri Do	user	2024-05-24 17:45:13.799	2024-05-24 17:45:13.859	$argon2id$v=19$m=65536,t=3,p=4$Y47Rs6VNfxygCBdbjxf1rw$YsZfN9KQTwWaqPKY5Uu0UF/hN7/LZ1GHv1lZDS74Nvc		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
7152aca2-95ba-495d-99e1-267890681cb0	tri14@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$wTOHtnWAZZbPOQ/nZVeTUg$8iLqltUhy8Q+qJYqdMeuIqSgO4/7KI3crrMStim1kwk	Tri Do 123	user	2024-05-29 15:24:49.217	2024-05-29 15:24:49.264	$argon2id$v=19$m=65536,t=3,p=4$fiUVcOkniqr26WYI/AAO/g$bYFGJNoqKLxyVA5cYHMvOk4IOQQ5ev2nHTH8ZvvaxtQ		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
4e28ad87-a7dd-4aaf-997f-a78d3a6fcb4a	tri2@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$RleF2y2wdFASsw7bVQP+LA$9fJ4kYdq6YyBRv0ZUmNtvaZLGmkaRhK1+S80xS+teKc	Tri Do	user	2024-05-24 17:45:09.456	2024-06-04 05:55:45.067	$argon2id$v=19$m=65536,t=3,p=4$3Xt2ZVBRstmpDtkAzZC+tQ$kk7Vv0NEFOigUE2I+KTOAiIaSCllRU4mLz7YXZCvQ1E		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
9ab9d428-fad9-4590-a42d-b436a51d5612	tri11@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$ZwF2+dLuGuco3awBTyJUkQ$IClB1N12MZB8LUlqmyAlbi5Y3ry+Fs1UDAUaL90x9dY	Tri Do	user	2024-05-29 09:09:57.835	2024-05-29 09:09:57.879	$argon2id$v=19$m=65536,t=3,p=4$zqky+FJcEyUZNvllg/v/8Q$D1xHinAb0QnseLm9XTCoLTM65FPwgk+nUoPINC5gMEc		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
2faccc72-6019-442f-a997-9b01a85c43a7	admin@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$r39jlQH0YIuk+ukItdb22A$1uheMaxuKs+tD+OtlOIY7DierdFUEMI5ZcPQMlGTqXQ	Admin	admin	2024-05-24 16:47:25.882	2024-06-06 02:42:41.286	$argon2id$v=19$m=65536,t=3,p=4$lqwPSQgHAIwAdbAdoJ1GKQ$iMcvn4fFU9/YLLyASjtEGjr1kshLisat1GCPdgF6Vdk		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
101fc207-61eb-4d6f-bbbd-03791d7dfa08	tri12@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$CZ3UNrKxqS9iXBzmpdDHAg$ODiYe2lUYrGmo9/4diaQz/bcfrUCaaoe6nPlcOEuofw	Tri Dep Trai	user	2024-05-29 13:13:56.48	2024-05-29 13:36:02.954	$argon2id$v=19$m=65536,t=3,p=4$B58UZldzfGhN3S/NGG2ZYQ$QP2Spmv/p4nI1XpPsWy8Bw/EVEnHPCa21A8cQqiLRz4		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
2cbe6161-183d-42bd-8a8c-3db79d104caf	tri10@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$1TjDTbt72IBtRBWx/WMI4w$W9ya66rdhkcu3RIBFprjLO7Tu1BbaBZDEV8oHAM7YRA	Tri Do	user	2024-05-24 17:45:37.578	2024-05-31 16:57:27.274	$argon2id$v=19$m=65536,t=3,p=4$9QJzIWETMytyjEwojwbiIg$Ad0EJsKsHj4DhKF8iF2wEBT7q6LYURMGdAycjENPAIs		https://firebasestorage.googleapis.com/v0/b/bookstore-70c15.appspot.com/o/storage%2Fdefault-user.jpeg?alt=media	
\.


--
-- Name: About_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."About_id_seq"', 1, true);


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.authors_id_seq', 17, true);


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_id_seq', 23, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 10, true);


--
-- Name: promotion_lists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_lists_id_seq', 6, true);


--
-- Name: rating_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rating_reviews_id_seq', 15, true);


--
-- Name: About About_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."About"
    ADD CONSTRAINT "About_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: book_author book_author_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT book_author_pkey PRIMARY KEY (book_id, author_id);


--
-- Name: book_category book_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category
    ADD CONSTRAINT book_category_pkey PRIMARY KEY (book_id, category_id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_id, book_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: promotion_lists promotion_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_lists
    ADD CONSTRAINT promotion_lists_pkey PRIMARY KEY (id);


--
-- Name: rating_reviews rating_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rating_reviews
    ADD CONSTRAINT rating_reviews_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: authors_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX authors_slug_key ON public.authors USING btree (slug);


--
-- Name: books_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX books_slug_key ON public.books USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: promotion_lists_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotion_lists_slug_key ON public.promotion_lists USING btree (slug);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: book_author fk_book_author_author; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT fk_book_author_author FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


--
-- Name: book_author fk_book_author_book; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT fk_book_author_book FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_category fk_book_category_book; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category
    ADD CONSTRAINT fk_book_category_book FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_category fk_book_category_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category
    ADD CONSTRAINT fk_book_category_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: books fk_book_promotion_list; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT fk_book_promotion_list FOREIGN KEY (promotion_list_id) REFERENCES public.promotion_lists(id) ON DELETE SET NULL;


--
-- Name: order_items fk_order_item_book; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_item_book FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: order_items fk_order_item_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders fk_order_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rating_reviews fk_rating_review_book; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rating_reviews
    ADD CONSTRAINT fk_rating_review_book FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: rating_reviews fk_rating_review_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rating_reviews
    ADD CONSTRAINT fk_rating_review_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

