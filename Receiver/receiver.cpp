#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>
#include <map>
#include "RF24/RF24.h"

using namespace std;

typedef struct {
    uint16_t car;
    uint16_t send_delay;
    uint16_t retry_count;
    uint16_t message_id;
} msgType;

typedef struct {
    uint16_t message_id;
    long long receive_timestamp;
} timePairType;

const uint8_t pipes[][6] = {"1Node","2Node"};       // radio send/receive pipes
const uint16_t id_immortality_time = 4000;          // time threshold for the next event with same id  to be allowed to register again  (ms)
const uint16_t sleep_time = 700;                            // main loop usleep time for less cpu usage (us). Low values = high cpu utilisation
timePairType timePair;                                              // keeps last message id and  receive time 
map<uint16_t, timePairType> cars;                       // maps car number to the last msg/time pair

/**
 * Gets current time (ms)
 */
long long milis() {
    struct timeval tp;
    gettimeofday(&tp, NULL);
    return (long long) tp.tv_sec * 1000L + tp.tv_usec / 1000;   
}

/**
 * Checks if received message should be registered as valid event
 */
bool register_event (msgType* message, long long mslong) {

    bool validMessage = true;

    if(!cars.empty() && cars.count(message->car)) {
        // car record exists - check if existing car message has same id
        if (cars[message->car].message_id==message->message_id) {
                // check id_immortality_time to decide if the old message is valid or the new one
                if (mslong-cars[message->car].receive_timestamp<id_immortality_time) {
                    // old message still valid - reject current message as a duplicate
                    validMessage = false;
                }  
            } else {
                if(message->message_id-cars[message->car].message_id>1) {
                        // Missing id
                        printf("Package loss possible.  ID - current :  %u last:  %u \n", message->message_id,  cars[message->car].message_id);
                }
            }
            // Time from the last message - for testing purposes
            printf("Lap time: %llu \n", mslong-cars[message->car].receive_timestamp-message->send_delay);
    }
    
    if (validMessage) {
        // just add current id/time pair to the map and consider message as registered event 
        timePair.message_id=message->message_id;
        timePair.receive_timestamp=mslong;
        cars[message->car]=timePair;
    }
    
    return validMessage;
}

/**
 * POST the event to the Web application 
 */
void post_event() {
    
    // TODO - implement :)
}

/**
 * Initialisation and main loop
 */
int main(int argc, char **argv) {
    
    msgType message;                                // radio message 
    long long message_time;                     // meessage receive time (ms)
    
    message.car = 0;
    message.send_delay = 0;
    
    printf("Initializing radio \n");
    RF24 radio( 
                            RPI_V2_GPIO_P1_22, 
                            RPI_V2_GPIO_P1_24, 
                            BCM2835_SPI_SPEED_4MHZ
                        );
    radio.begin();
    radio.setRetries(15,25);
    radio.setPALevel(RF24_PA_LOW);  
    radio.setAutoAck(1); 
    radio.setPayloadSize(sizeof(msgType));
    radio.setChannel(111);
    radio.printDetails();
    radio.openWritingPipe(pipes[1]);
    radio.openReadingPipe(1,pipes[0]);
    radio.startListening();

    printf("===== Listening ====\n");
    while(1) {
        
        if (radio.available()) {
            radio.read(&message, sizeof(msgType));
            message_time = milis();
            if (register_event(&message, message_time)) {
                printf ("Event registered  (car :: try :: delay :: msg)  %u  ::  %u  ::  %u  ::  %u  \n", 
                    message.car, 
                    message.retry_count, 
                    message.send_delay, 
                    message.message_id
                );
                post_event();
            } else {
                printf ("Message rejected  \n"); 
            }
        } else {
            // no data available, put the cpu to sleep for some us
            usleep(sleep_time);
        }
        
    }
    return 0;
}
