from bs4 import BeautifulSoup
import feedparser

def parse(url):
  pass

def parse_feed(url):
  d = feedparser.parse(url)
  return [{'title': e.title, 'description': e.description, 'link': e.link} for e in d.entries]
