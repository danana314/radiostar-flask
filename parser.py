from bs4 import BeautifulSoup
import feedparser

def parse(url):
  pass

def parse_feed(url):
  d = feedparser.parse(url)
  return [e.title for e in d.entries]
