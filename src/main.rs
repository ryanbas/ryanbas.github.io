use std::fs;
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:5055").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    // println!("Request: {}", String::from_utf8_lossy(&buffer[..]));

    let (status_line, filename) = if page_exists(&buffer) {
        if is_index(&buffer) {
            ("HTTP/1.1 200 OK", "blog/index.html")
        } else if buffer.starts_with(GET_001_BLOG_ENTRY) {
            ("HTTP/1.1 200 OK", "blog/entries/001.html")
        } else if buffer.starts_with(GET_002_BLOG_ENTRY) {
            ("HTTP/1.1 200 OK", "blog/entries/002.html")
        } else if buffer.starts_with(GET_003_BLOG_ENTRY) {
            ("HTTP/1.1 200 OK", "blog/entries/003.html")
        } else if buffer.starts_with(GET_004_BLOG_ENTRY) {
            ("HTTP/1.1 200 OK", "blog/entries/004.html")
        } else if buffer.starts_with(GET_005_BLOG_ENTRY) {
            ("HTTP/1.1 200 OK", "blog/entries/005.html")
        } else if buffer.starts_with(GET_006_BLOG_ENTRY) {
            ("HTTP/1.1 200 OK", "blog/entries/006.html")
        } else {
            ("HTTP/1.1 404 NOT FOUND", "blog/404_not_found.html")
        }
    } else {
        ("HTTP/1.1 404 NOT FOUND", "blog/404_not_found.html")
    };

    let contents = fs::read_to_string(filename).unwrap();
    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        contents.len(),
        contents
    );

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn page_exists(buffer: &[u8]) -> bool {
    is_index(buffer) || is_blog_entry(buffer)
}

const GET_BLOG_INDEX_0: &[u8] = b"GET / HTTP/1.1\r\n";
const GET_BLOG_INDEX_1: &[u8] = b"GET /blog HTTP/1.1\r\n";
const GET_BLOG_INDEX_2: &[u8] = b"GET /blog/ HTTP/1.1\r\n";
const GET_BLOG_INDEX_3: &[u8] = b"GET /blog/index.html HTTP/1.1\r\n";
const GET_BLOG_INDEX_4: &[u8] = b"GET /index.html HTTP/1.1\r\n";
fn is_index(buffer: &[u8]) -> bool {
    buffer.starts_with(GET_BLOG_INDEX_0)
        || buffer.starts_with(GET_BLOG_INDEX_1)
        || buffer.starts_with(GET_BLOG_INDEX_2)
        || buffer.starts_with(GET_BLOG_INDEX_3)
        || buffer.starts_with(GET_BLOG_INDEX_4)
}

const GET_001_BLOG_ENTRY: &[u8] = b"GET /blog/entries/001.html HTTP/1.1\r\n";
const GET_002_BLOG_ENTRY: &[u8] = b"GET /blog/entries/002.html HTTP/1.1\r\n";
const GET_003_BLOG_ENTRY: &[u8] = b"GET /blog/entries/003.html HTTP/1.1\r\n";
const GET_004_BLOG_ENTRY: &[u8] = b"GET /blog/entries/004.html HTTP/1.1\r\n";
const GET_005_BLOG_ENTRY: &[u8] = b"GET /blog/entries/005.html HTTP/1.1\r\n";
const GET_006_BLOG_ENTRY: &[u8] = b"GET /blog/entries/006.html HTTP/1.1\r\n";
fn is_blog_entry(buffer: &[u8]) -> bool {
    buffer.starts_with(GET_001_BLOG_ENTRY)
        || buffer.starts_with(GET_002_BLOG_ENTRY)
        || buffer.starts_with(GET_003_BLOG_ENTRY)
        || buffer.starts_with(GET_004_BLOG_ENTRY)
        || buffer.starts_with(GET_005_BLOG_ENTRY)
        || buffer.starts_with(GET_006_BLOG_ENTRY)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slash_is_index() {
        let test_buf = b"GET / HTTP/1.1\r\n";
        assert!(is_index(test_buf));
    }

    #[test]
    fn test_index_html_is_index() {
        let test_buf = b"GET /index.html HTTP/1.1\r\n";
        assert!(is_index(test_buf));
    }

    #[test]
    fn test_blog_is_index() {
        let test_buf = b"GET /blog HTTP/1.1\r\n";
        assert!(is_index(test_buf));

        let test_buf = b"GET /blog/ HTTP/1.1\r\n";
        assert!(is_index(test_buf));
    }

    #[test]
    fn test_blog_index_html_is_index() {
        let test_buf = b"GET /blog/index.html HTTP/1.1\r\n";
        assert!(is_index(test_buf));
    }

    #[test]
    fn test_blog_entry_is_not_index() {
        let test_buf = b"GET /blog/entries/001.html HTTP/1.1\r\n";
        assert!(!is_index(test_buf));
    }

    #[test]
    fn test_there_are_exactly_6_blog_entries() {
        let test_buf = b"GET /blog/entries/001.html HTTP/1.1\r\n";
        assert!(is_blog_entry(test_buf));
        let test_buf = b"GET /blog/entries/002.html HTTP/1.1\r\n";
        assert!(is_blog_entry(test_buf));
        let test_buf = b"GET /blog/entries/003.html HTTP/1.1\r\n";
        assert!(is_blog_entry(test_buf));
        let test_buf = b"GET /blog/entries/004.html HTTP/1.1\r\n";
        assert!(is_blog_entry(test_buf));
        let test_buf = b"GET /blog/entries/005.html HTTP/1.1\r\n";
        assert!(is_blog_entry(test_buf));
        let test_buf = b"GET /blog/entries/006.html HTTP/1.1\r\n";
        assert!(is_blog_entry(test_buf));
    }

    #[test]
    fn test_other_blog_entries_do_not_work() {
        let test_buf = b"GET /blog/entries/000.html HTTP/1.1\r\n";
        assert!(!is_blog_entry(test_buf));
        let test_buf = b"GET /blog/entries/007.html HTTP/1.1\r\n";
        assert!(!is_blog_entry(test_buf));
    }

    #[test]
    fn test_all_endpoints_exist() {
        let test_buf = b"GET / HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /index.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/ HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/index.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/entries/001.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/entries/002.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/entries/003.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/entries/004.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/entries/005.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
        let test_buf = b"GET /blog/entries/006.html HTTP/1.1\r\n";
        assert!(page_exists(test_buf));
    }
}
