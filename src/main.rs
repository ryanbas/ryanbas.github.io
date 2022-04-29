use std::fs;
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

const OK_STATUS_LINE: &'static str = "HTTP/1.1 200 OK";
const NOT_FOUND_STATUS_LINE: &'static str = "HTTP/1.1 404 NOT FOUND";

// All valid endpoints
const GET_BLOG_INDEX_0: &'static str = "GET / HTTP/1.1\r\n";
const GET_BLOG_INDEX_1: &'static str = "GET /blog HTTP/1.1\r\n";
const GET_BLOG_INDEX_2: &'static str = "GET /blog/ HTTP/1.1\r\n";
const GET_BLOG_INDEX_3: &'static str = "GET /blog/index.html HTTP/1.1\r\n";
const GET_BLOG_INDEX_4: &'static str = "GET /index.html HTTP/1.1\r\n";
const GET_001_BLOG_ENTRY: &'static str = "GET /blog/entries/001.html HTTP/1.1\r\n";
const GET_002_BLOG_ENTRY: &'static str = "GET /blog/entries/002.html HTTP/1.1\r\n";
const GET_003_BLOG_ENTRY: &'static str = "GET /blog/entries/003.html HTTP/1.1\r\n";
const GET_004_BLOG_ENTRY: &'static str = "GET /blog/entries/004.html HTTP/1.1\r\n";
const GET_005_BLOG_ENTRY: &'static str = "GET /blog/entries/005.html HTTP/1.1\r\n";
const GET_006_BLOG_ENTRY: &'static str = "GET /blog/entries/006.html HTTP/1.1\r\n";

#[derive(PartialEq, Debug)]
struct Response {
    status_line: String,
    file_path: String,
}

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

    let response = build_response(&buffer);
    let contents = fs::read_to_string(response.file_path).unwrap();
    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        response.status_line,
        contents.len(),
        contents
    );

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn build_response(buffer: &[u8]) -> Response {
    if is_index(&buffer) {
        Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/index.html"),
        }
    } else if buffer.starts_with(GET_001_BLOG_ENTRY.as_bytes()) {
        Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/entries/001.html"),
        }
    } else if buffer.starts_with(GET_002_BLOG_ENTRY.as_bytes()) {
        Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/entries/002.html"),
        }
    } else if buffer.starts_with(GET_003_BLOG_ENTRY.as_bytes()) {
        Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/entries/003.html"),
        }
    } else if buffer.starts_with(GET_004_BLOG_ENTRY.as_bytes()) {
        Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/entries/004.html"),
        }
    } else if buffer.starts_with(GET_005_BLOG_ENTRY.as_bytes()) {
        Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/entries/005.html"),
        }
    } else if buffer.starts_with(GET_006_BLOG_ENTRY.as_bytes()) {
        Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/entries/006.html"),
        }
    } else {
        Response {
            status_line: NOT_FOUND_STATUS_LINE.to_string(),
            file_path: String::from("blog/404_not_found.html"),
        }
    }
}

fn is_index(buffer: &[u8]) -> bool {
    buffer.starts_with(GET_BLOG_INDEX_0.as_bytes())
        || buffer.starts_with(GET_BLOG_INDEX_1.as_bytes())
        || buffer.starts_with(GET_BLOG_INDEX_2.as_bytes())
        || buffer.starts_with(GET_BLOG_INDEX_3.as_bytes())
        || buffer.starts_with(GET_BLOG_INDEX_4.as_bytes())
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
    fn test_all_endpoints_generate_correct_response() {
        let test_buf = b"GET / HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );
        let test_buf = b"GET /index.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );
        let test_buf = b"GET /blog HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );
        let test_buf = b"GET /blog/ HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );
        let test_buf = b"GET /blog/index.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );
        let test_buf = b"GET /blog/entries/001.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/001.html")
            }
        );
        let test_buf = b"GET /blog/entries/002.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/002.html")
            }
        );
        let test_buf = b"GET /blog/entries/003.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/003.html")
            }
        );
        let test_buf = b"GET /blog/entries/004.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/004.html")
            }
        );
        let test_buf = b"GET /blog/entries/005.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/005.html")
            }
        );
        let test_buf = b"GET /blog/entries/006.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/006.html")
            }
        );
    }

    #[test]
    fn test_bad_endpoints_result_in_404() {
        let test_buf = b"GET /blog/entries/000.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 404 NOT FOUND"),
                file_path: String::from("blog/404_not_found.html"),
            }
        );
        let test_buf = b"GET /blog/entries/007.html HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 404 NOT FOUND"),
                file_path: String::from("blog/404_not_found.html"),
            }
        );
        let test_buf = b"GET /dontexist HTTP/1.1\r\n";
        assert_eq!(
            build_response(test_buf),
            Response {
                status_line: String::from("HTTP/1.1 404 NOT FOUND"),
                file_path: String::from("blog/404_not_found.html"),
            }
        );
    }
}
