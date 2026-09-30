ARG BASE_IMAGE
FROM ${BASE_IMAGE}
ENV DEBIAN_FRONTEND=noninteractive DISPLAY=:99 LD_LIBRARY_PATH=/opt/legacy/lib/x86_64-linux-gnu
RUN apt-get update && apt-get install -y --no-install-recommends xvfb=2:1.20.13-1ubuntu1~20.04.20 unzip=6.0-25ubuntu1.2 ca-certificates=20240203~20.04.1 libgtk2.0-0=2.24.32-4ubuntu4.1 libnss3=2:3.98-0ubuntu0.20.04.2 libgconf-2-4=3.2.6-6ubuntu1 libasound2=1.2.2-2.1ubuntu2.5 libxss1=1:1.2.3-1 libxtst6=2:1.2.3-1 libgbm1=21.2.6-0ubuntu0.1~20.04.2 libudev1=245.4-4ubuntu3.24 fonts-wqy-zenhei=0.9.45-7ubuntu1 python3=3.8.2-0ubuntu2 && rm -rf /var/lib/apt/lists/*
COPY chromium.zip chromedriver.zip libgcrypt11.deb SHA256SUMS /tmp/downloads/
RUN cd /tmp/downloads && sha256sum -c SHA256SUMS && dpkg-deb -x libgcrypt11.deb /opt/legacy && unzip -q chromium.zip -d /opt && unzip -q chromedriver.zip -d /usr/local/bin && chmod +x /opt/chrome-linux/chrome /usr/local/bin/chromedriver && ln -s /lib/x86_64-linux-gnu/libudev.so.1 /lib/x86_64-linux-gnu/libudev.so.0 && rm -rf /tmp/downloads
RUN /opt/chrome-linux/chrome --version > /opt/browser-version.txt && dpkg-query -W > /opt/packages.txt
COPY start.sh /usr/local/bin/start-legacy
EXPOSE 9515
CMD ["sh", "/usr/local/bin/start-legacy"]
