use std::fs;
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

const OK_STATUS_LINE: &'static str = "HTTP/1.1 200 OK";
const NOT_FOUND_STATUS_LINE: &'static str = "HTTP/1.1 404 NOT FOUND";
const NOT_IMPLEMENTED_STATUS_LINE: &'static str = "HTTP/1.1 501 NOT IMPLEMENTED";

#[derive(PartialEq, Debug)]
struct Request {
    method: RequestMethod,
    path: String,
    version: String,
}

#[derive(PartialEq, Debug)]
enum RequestMethod {
    GET,
}

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

    let request = parse_request(&buffer[..]);
    let (status_line, contents) = match request {
        Some(request) => {
            let response = build_response(request);
            let contents = fs::read_to_string(response.file_path).unwrap();
            (response.status_line, contents)
        }
        None => {
            println!(
                "Encountered a bad request: {}",
                String::from_utf8_lossy(&buffer),
            );

            let status_line = NOT_IMPLEMENTED_STATUS_LINE.to_string();
            let contents = String::from("");
            (status_line, contents)
        }
    };

    let response_string = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        contents.len(),
        contents
    );

    stream.write(response_string.as_bytes()).unwrap();
    stream.flush().unwrap();
}

/// All the valid endpoints that can be used. To add a new page append to this array.
const ENDPOINTS: &'static [&'static str] = &[
    "/",
    "/blog",
    "/blog/",
    "/blog/index.html",
    "/index.html",
    "/blog/entries/001.html",
    "/blog/entries/002.html",
    "/blog/entries/003.html",
    "/blog/entries/004.html",
    "/blog/entries/005.html",
    "/blog/entries/006.html",
];

/// Parses the request from the buffer and generates a Request object
/// Returns None if the request uses an invalid method (POST, PUT, etc)
/// but will return a valid request for paths that do not exist.
fn parse_request(buffer: &[u8]) -> Option<Request> {
    let mut iter_buffer = buffer.splitn(3, |&b| b == b' ');
    let method = iter_buffer.next();
    let path = iter_buffer.next();
    let version = iter_buffer.next();

    match (method, path, version) {
        (Some(b"GET"), Some(path), Some(version)) => Some(Request {
            method: RequestMethod::GET,
            path: std::str::from_utf8(path).unwrap().to_string(),
            version: std::str::from_utf8(version).unwrap().to_string(),
        }),
        _ => None,
    }
}

/// Maps a Request to a Response. Every Request will be mapped to a Response
/// and if the path doesn't exist it will return a 404 response.
/// TODO review the logic of this function; do we really want
fn build_response(request: Request) -> Response {
    match request.path {
        path if is_index(&path) => Response {
            status_line: OK_STATUS_LINE.to_string(),
            file_path: String::from("blog/index.html"),
        },
        path if is_blog(&path) => Response {
            status_line: OK_STATUS_LINE.to_string(),
            // cut off the leading '/' and use relative paths
            // TODO I'd rather this be an absolute path and add the concept of a
            // root path that the server can't access outside of it
            file_path: path[1..].to_string(),
        },
        _ => Response {
            status_line: NOT_FOUND_STATUS_LINE.to_string(),
            file_path: String::from("blog/404_not_found.html"),
        },
    }
}

fn is_index(path: &String) -> bool {
    path == ENDPOINTS[0]
        || path == ENDPOINTS[1]
        || path == ENDPOINTS[2]
        || path == ENDPOINTS[3]
        || path == ENDPOINTS[4]
}

fn is_blog(path: &String) -> bool {
    path == ENDPOINTS[5]
        || path == ENDPOINTS[6]
        || path == ENDPOINTS[7]
        || path == ENDPOINTS[8]
        || path == ENDPOINTS[9]
        || path == ENDPOINTS[10]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slash_is_index() {
        let test_buf = String::from("/");
        assert!(is_index(&test_buf));
    }

    #[test]
    fn test_index_html_is_index() {
        let test_buf = String::from("/index.html");
        assert!(is_index(&test_buf));
    }

    #[test]
    fn test_blog_is_index() {
        let test_buf = String::from("/blog");
        assert!(is_index(&test_buf));

        let test_buf = String::from("/blog/");
        assert!(is_index(&test_buf));
    }

    #[test]
    fn test_blog_index_html_is_index() {
        let test_buf = String::from("/blog/index.html");
        assert!(is_index(&test_buf));
    }

    #[test]
    fn test_blog_entry_is_not_index() {
        let test_buf = String::from("/blog/entries/001.html");

        assert!(!is_index(&test_buf));
    }

    #[test]
    fn test_all_endpoints_generate_correct_response() {
        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/index.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/index.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/index.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/001.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/001.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/002.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/002.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/003.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/003.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/004.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/004.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/005.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/005.html")
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/006.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 200 OK"),
                file_path: String::from("blog/entries/006.html")
            }
        );
    }

    #[test]
    fn test_bad_endpoints_result_in_404() {
        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/000.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 404 NOT FOUND"),
                file_path: String::from("blog/404_not_found.html"),
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/blog/entries/007.html"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 404 NOT FOUND"),
                file_path: String::from("blog/404_not_found.html"),
            }
        );

        let request = Request {
            method: RequestMethod::GET,
            path: String::from("/dontexist"),
            version: String::from("HTTP/1.1\n\r"),
        };
        assert_eq!(
            build_response(request),
            Response {
                status_line: String::from("HTTP/1.1 404 NOT FOUND"),
                file_path: String::from("blog/404_not_found.html"),
            }
        );
    }

    #[test]
    fn test_parse_response_parses_some_get_requests() {
        let test_buf = b"GET / HTTP/1.1\r\n";
        assert_eq!(
            parse_request(test_buf),
            Some(Request {
                method: RequestMethod::GET,
                path: String::from("/"),
                version: String::from("HTTP/1.1\r\n")
            })
        );

        let test_buf = b"GET /blog/entries/001.html HTTP/1.1\r\n";
        assert_eq!(
            parse_request(test_buf),
            Some(Request {
                method: RequestMethod::GET,
                path: String::from("/blog/entries/001.html"),
                version: String::from("HTTP/1.1\r\n")
            })
        );

        let test_buf = b"GET /i/dont/exist HTTP/1.1\r\n";
        assert_eq!(
            parse_request(test_buf),
            Some(Request {
                method: RequestMethod::GET,
                path: String::from("/i/dont/exist"),
                version: String::from("HTTP/1.1\r\n")
            })
        );
    }

    #[test]
    fn test_different_methods_do_not_work() {
        let test_buf = b"POST /blog/ HTTP/1.1\r\n";
        assert_eq!(parse_request(test_buf), None);

        let test_buf = b"PUT /blog/entries/000.html HTTP/1.1\r\n";
        assert_eq!(parse_request(test_buf), None);

        let test_buf = b"DELETE /index.html HTTP/1.1\r\n";
        assert_eq!(parse_request(test_buf), None);

        let test_buf = b"PATCH /blog/entries/ HTTP/1.1\r\n";
        assert_eq!(parse_request(test_buf), None);
    }
}
